// KnockGames.eu PHP Server Starter
console.log('=== KnockGames.eu PHP Server ===');
console.log('Starte PHP-Server...');

const { spawn } = require('child_process');
const fs = require('fs');

// Erstelle data-Verzeichnis falls nicht vorhanden
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
    console.log('Data-Verzeichnis erstellt.');
}

// Starte PHP-Server
const phpServer = spawn('php', ['-S', '0.0.0.0:5000', '-t', '.', 'router.php'], {
    stdio: 'inherit'
});

console.log('Server läuft auf http://0.0.0.0:5000');
console.log('Admin Panel: http://0.0.0.0:5000/admin');
console.log('Standard Admin-Zugangsdaten: admin/admin123');
console.log('');

phpServer.on('error', (err) => {
    console.error('PHP-Server Fehler:', err);
});

phpServer.on('close', (code) => {
    console.log(`PHP-Server beendet mit Code ${code}`);
});
let mysqlConnection = null;
let usingMySQL = false;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// File-based data storage (fallback for MySQL)
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');

// Initialize data storage
async function initializeDataStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize users file
    try {
      await fs.access(USERS_FILE);
    } catch {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          email: 'admin@knockgames.eu',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }

    // Initialize announcements file
    try {
      await fs.access(ANNOUNCEMENTS_FILE);
    } catch {
      const defaultAnnouncements = [
        {
          id: 1,
          title: 'Willkommen bei KnockGames!',
          content: 'Herzlich willkommen auf unserem Minecraft Training Server. Hier findest du die besten PvP-Trainingsmöglichkeiten.',
          type: 'success',
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Server Update',
          content: 'Unser Server wurde erfolgreich aktualisiert. Neue Features sind verfügbar!',
          type: 'info',
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Wartungsarbeiten',
          content: 'Geplante Wartungsarbeiten am Sonntag von 2-4 Uhr morgens.',
          type: 'warning',
          active: true,
          created_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(ANNOUNCEMENTS_FILE, JSON.stringify(defaultAnnouncements, null, 2));
    }

    // Initialize news file
    try {
      await fs.access(NEWS_FILE);
    } catch {
      const defaultNews = [
        {
          id: 1,
          title: 'Neue PvP Arena eröffnet',
          content: 'Wir freuen uns, die Eröffnung unserer brandneuen PvP Arena bekannt zu geben. Mit modernster Ausstattung und verschiedenen Kampfmodi bietet sie das ultimative Trainingsvergnügen.',
          excerpt: 'Brandneue PvP Arena mit modernster Ausstattung jetzt verfügbar.',
          published: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Training-Update 2.0',
          content: 'Das große Training-Update 2.0 ist da! Neue Übungsmodule, verbesserte KI-Gegner und erweiterte Statistiken warten auf euch.',
          excerpt: 'Umfangreiches Update mit neuen Trainingsfeatures und Verbesserungen.',
          published: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Community Event angekündigt',
          content: 'Unser erstes großes Community-Event findet nächsten Monat statt. Teilnehmer können exklusive Belohnungen und Ränge gewinnen.',
          excerpt: 'Großes Community-Event mit exklusiven Belohnungen angekündigt.',
          published: true,
          created_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(NEWS_FILE, JSON.stringify(defaultNews, null, 2));
    }

    console.log('Data storage initialized successfully');
  } catch (error) {
    console.error('Error initializing data storage:', error);
  }
}

// Helper functions for file operations
async function readJsonFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Serve static files
app.use(express.static('.'));
app.use('/admin', express.static('admin'));

// Admin route - serve index.html when accessing /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Root route serves main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL Setup Routes
app.get('/admin/mysql-setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'mysql-setup.html'));
});

app.post('/api/mysql/test', async (req, res) => {
  const { host, port, database, user, password } = req.body;
  
  // Validate required fields
  if (!host || !port || !database || !user) {
    return res.status(400).json({ error: 'Alle Felder außer Passwort sind erforderlich' });
  }
  
  let connection = null;
  
  try {
    // Try to load mysql2 module
    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch (moduleError) {
      return res.status(500).json({ error: 'MySQL2-Modul nicht verfügbar. Bitte installieren Sie mysql2.' });
    }
    
    connection = await mysql.createConnection({
      host: host.trim(),
      port: parseInt(port),
      database: database.trim(),
      user: user.trim(),
      password: password || '',
      connectTimeout: 10000,
      acquireTimeout: 10000
    });
    
    await connection.execute('SELECT 1 as test');
    await connection.end();
    
    res.json({ success: true, message: 'Verbindung erfolgreich' });
  } catch (error) {
    console.error('MySQL test error:', error);
    
    // Close connection if it was created
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing test connection:', closeError);
      }
    }
    
    // Return specific error message
    let errorMessage = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Verbindung verweigert. Überprüfen Sie, ob MySQL läuft und die Verbindungsdaten korrekt sind.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Zugriff verweigert. Überprüfen Sie Benutzername und Passwort.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Datenbank nicht gefunden. Überprüfen Sie den Datenbanknamen.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Host nicht gefunden. Überprüfen Sie die Hostadresse.';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

app.post('/api/mysql/configure', async (req, res) => {
  const { host, port, database, user, password } = req.body;
  
  // Validate required fields
  if (!host || !port || !database || !user) {
    return res.status(400).json({ error: 'Alle Felder außer Passwort sind erforderlich' });
  }
  
  try {
    // Try to load mysql2 module
    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch (moduleError) {
      return res.status(500).json({ error: 'MySQL2-Modul nicht verfügbar. Bitte installieren Sie mysql2.' });
    }
    
    // Create MySQL connection
    mysqlConnection = await mysql.createConnection({
      host: host.trim(),
      port: parseInt(port),
      database: database.trim(),
      user: user.trim(),
      password: password || '',
      connectTimeout: 10000,
      acquireTimeout: 10000
    });
    
    // Test the connection
    await mysqlConnection.execute('SELECT 1 as test');
    usingMySQL = true;
    
    // Save configuration for future restarts
    const config = { 
      host: host.trim(), 
      port: parseInt(port), 
      database: database.trim(), 
      user: user.trim(), 
      password: password || '' 
    };
    await fs.writeFile('./mysql-config.json', JSON.stringify(config, null, 2));
    
    console.log('MySQL connection configured successfully');
    res.json({ success: true, message: 'MySQL erfolgreich konfiguriert' });
  } catch (error) {
    console.error('MySQL configuration error:', error);
    
    // Close connection if it was created
    if (mysqlConnection) {
      try {
        await mysqlConnection.end();
      } catch (closeError) {
        console.error('Error closing MySQL connection:', closeError);
      }
      mysqlConnection = null;
    }
    
    usingMySQL = false;
    
    // Return specific error message
    let errorMessage = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Verbindung verweigert. Überprüfen Sie, ob MySQL läuft und die Verbindungsdaten korrekt sind.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Zugriff verweigert. Überprüfen Sie Benutzername und Passwort.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Datenbank nicht gefunden. Überprüfen Sie den Datenbanknamen.';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

app.get('/api/mysql/status', (req, res) => {
  res.json({ 
    connected: usingMySQL,
    database: usingMySQL ? 'MySQL' : 'JSON Files'
  });
});

// Public API endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await readJsonFile(ANNOUNCEMENTS_FILE);
    const activeAnnouncements = announcements.filter(a => a.active);
    res.json(activeAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const news = await readJsonFile(NEWS_FILE);
    const publishedNews = news.filter(n => n.published);
    res.json(publishedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/training-programs', async (req, res) => {
  try {
    // Return sample training programs
    const programs = [
      {
        id: 1,
        name: 'PvP Basis Training',
        description: 'Grundlagen des Player vs Player Kampfes',
        features: 'Schwert-Kombos, Bogen-Training, Rüstungs-Optimierung',
        price: 'Kostenlos',
        popular: true,
        active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Advanced Combat',
        description: 'Fortgeschrittene Kampftechniken',
        features: 'Erweiterte Kombos, Taktiken, Team-Strategien',
        price: '9.99€',
        popular: false,
        active: true,
        created_at: new Date().toISOString()
      }
    ];
    res.json(programs);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ error: 'Failed to fetch training programs' });
  }
});

// Server status endpoint
app.get('/api/server-status', async (req, res) => {
  try {
    const status = {
      online: true,
      players: {
        online: 42,
        max: 100
      },
      version: "1.20.4",
      motd: "KnockGames.eu - Minecraft Training Network",
      ping: 15
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({
      online: false,
      error: "Failed to check server status"
    });
  }
});

// Admin authentication endpoints
let adminSessions = new Map();

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const sessionId = Math.random().toString(36).substring(7);
      adminSessions.set(sessionId, { 
        id: user.id,
        username: user.username, 
        role: user.role 
      });
      
      res.json({
        sessionId,
        user: { 
          id: user.id,
          username: user.username, 
          role: user.role 
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    adminSessions.delete(sessionId);
  }
  res.json({ message: 'Logged out' });
});

// Middleware to check admin authentication
function isAuthenticated(req, res, next) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = adminSessions.get(sessionId);
  next();
}

// Admin endpoints
app.get('/api/admin/users', isAuthenticated, async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', isAuthenticated, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username,
      password,
      email: email || null,
      role: role || 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    
    const { password: _, ...safeUser } = newUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, role } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if username already exists (excluding current user)
    if (users.find(u => u.username === username && u.id !== parseInt(id))) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Update user data
    users[index] = {
      ...users[index],
      username,
      email: email || null,
      role,
      updated_at: new Date().toISOString()
    };
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      users[index].password = password;
    }
    
    await writeJsonFile(USERS_FILE, users);
    
    const { password: _, ...safeUser } = users[index];
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readJsonFile(USERS_FILE);
    
    const userToDelete = users.find(u => u.id === parseInt(id));
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last admin user
    const adminUsers = users.filter(u => u.role === 'admin');
    if (userToDelete.role === 'admin' && adminUsers.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin user' });
    }
    
    const filteredUsers = users.filter(u => u.id !== parseInt(id));
    await writeJsonFile(USERS_FILE, filteredUsers);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    const announcements = await readJsonFile(ANNOUNCEMENTS_FILE);
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    const { title, content, type, active } = req.body;
    const announcements = await readJsonFile(ANNOUNCEMENTS_FILE);
    
    const newAnnouncement = {
      id: Math.max(...announcements.map(a => a.id), 0) + 1,
      title,
      content,
      type: type || 'info',
      active: active !== undefined ? active : true,
      created_at: new Date().toISOString()
    };
    
    announcements.push(newAnnouncement);
    await writeJsonFile(ANNOUNCEMENTS_FILE, announcements);
    
    res.json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

app.put('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, active } = req.body;
    const announcements = await readJsonFile(ANNOUNCEMENTS_FILE);
    
    const index = announcements.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    announcements[index] = {
      ...announcements[index],
      title,
      content,
      type,
      active,
      updated_at: new Date().toISOString()
    };
    
    await writeJsonFile(ANNOUNCEMENTS_FILE, announcements);
    res.json(announcements[index]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

app.delete('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const announcements = await readJsonFile(ANNOUNCEMENTS_FILE);
    
    const filteredAnnouncements = announcements.filter(a => a.id !== parseInt(id));
    await writeJsonFile(ANNOUNCEMENTS_FILE, filteredAnnouncements);
    
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

app.get('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    const news = await readJsonFile(NEWS_FILE);
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    const { title, content, excerpt, published } = req.body;
    const news = await readJsonFile(NEWS_FILE);
    
    const newArticle = {
      id: Math.max(...news.map(n => n.id), 0) + 1,
      title,
      content,
      excerpt: excerpt || null,
      published: published !== undefined ? published : false,
      created_at: new Date().toISOString()
    };
    
    news.push(newArticle);
    await writeJsonFile(NEWS_FILE, news);
    
    res.json(newArticle);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

app.put('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, published } = req.body;
    const news = await readJsonFile(NEWS_FILE);
    
    const index = news.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'News article not found' });
    }
    
    news[index] = {
      ...news[index],
      title,
      content,
      excerpt,
      published,
      updated_at: new Date().toISOString()
    };
    
    await writeJsonFile(NEWS_FILE, news);
    res.json(news[index]);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

app.delete('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const news = await readJsonFile(NEWS_FILE);
    
    const filteredNews = news.filter(n => n.id !== parseInt(id));
    await writeJsonFile(NEWS_FILE, filteredNews);
    
    res.json({ message: 'News article deleted' });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize and start server
async function startServer() {
  await initializeDataStorage();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Admin Panel: http://localhost:5000/admin');
    console.log('Default admin credentials: admin/admin123');
    console.log('Data stored in JSON files (./data/ directory)');
    console.log('For MySQL connection, configure environment variables and use server-mysql.js');
  });
}

startServer();