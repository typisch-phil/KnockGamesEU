const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MySQL Database configuration
const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'knockgames',
  port: process.env.MYSQL_PORT || 3306
};

let connection = null;

// Initialize MySQL connection and create database/tables
async function initializeDatabase() {
  try {
    // First connect without specifying database to create it if needed
    const tempConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await tempConnection.end();

    // Now connect to the specific database
    connection = await mysql.createConnection(DB_CONFIG);

    console.log('Connected to MySQL database:', DB_CONFIG.database);

    // Create tables
    await createTables();
    
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Please configure MySQL connection details in environment variables:');
    console.log('MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT');
  }
}

async function createTables() {
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create news_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create training_programs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        features TEXT,
        price VARCHAR(100),
        popular BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM users WHERE username = ?', ['admin']
    );

    if (adminExists.length === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', 'admin123', 'admin']
      );
      console.log('Default admin user created: admin/admin123');
    }

    // Insert sample data if tables are empty
    const [announcementCount] = await connection.execute('SELECT COUNT(*) as count FROM announcements');
    if (announcementCount[0].count === 0) {
      await connection.execute(`
        INSERT INTO announcements (title, content, type, active) VALUES
        ('Willkommen bei KnockGames!', 'Herzlich willkommen auf unserem Minecraft Training Server. Hier findest du die besten PvP-Trainingsmöglichkeiten.', 'success', true),
        ('Server Update', 'Unser Server wurde erfolgreich aktualisiert. Neue Features sind verfügbar!', 'info', true),
        ('Wartungsarbeiten', 'Geplante Wartungsarbeiten am Sonntag von 2-4 Uhr morgens.', 'warning', true)
      `);
    }

    const [newsCount] = await connection.execute('SELECT COUNT(*) as count FROM news_articles');
    if (newsCount[0].count === 0) {
      await connection.execute(`
        INSERT INTO news_articles (title, content, excerpt, published) VALUES
        ('Neue PvP Arena eröffnet', 'Wir freuen uns, die Eröffnung unserer brandneuen PvP Arena bekannt zu geben. Mit modernster Ausstattung und verschiedenen Kampfmodi bietet sie das ultimative Trainingsvergnügen.', 'Brandneue PvP Arena mit modernster Ausstattung jetzt verfügbar.', true),
        ('Training-Update 2.0', 'Das große Training-Update 2.0 ist da! Neue Übungsmodule, verbesserte KI-Gegner und erweiterte Statistiken warten auf euch.', 'Umfangreiches Update mit neuen Trainingsfeatures und Verbesserungen.', true),
        ('Community Event angekündigt', 'Unser erstes großes Community-Event findet nächsten Monat statt. Teilnehmer können exklusive Belohnungen und Ränge gewinnen.', 'Großes Community-Event mit exklusiven Belohnungen angekündigt.', true)
      `);
    }

    console.log('Database tables created and initialized successfully');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Serve static files
app.use(express.static('.'));
app.use('/admin', express.static('admin'));

// Root route serves main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'knockgames.html'));
});

// Public API endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT * FROM announcements WHERE active = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT * FROM news_articles WHERE published = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/training-programs', async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT * FROM training_programs WHERE active = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ error: 'Failed to fetch training programs' });
  }
});

// Server status endpoint
app.get('/api/server-status', async (req, res) => {
  try {
    const { host = 'play.knockgames.eu', port = 25565 } = req.query;
    
    // For demo purposes, return a static response
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
    
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length > 0) {
      const user = users[0];
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
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { username, password, email, role } = req.body;
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, password, email || null, role || 'user']
    );
    
    const [newUser] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { title, content, type, active } = req.body;
    const [result] = await connection.execute(
      'INSERT INTO announcements (title, content, type, active) VALUES (?, ?, ?, ?)',
      [title, content, type || 'info', active !== undefined ? active : true]
    );
    
    const [newAnnouncement] = await connection.execute(
      'SELECT * FROM announcements WHERE id = ?',
      [result.insertId]
    );
    
    res.json(newAnnouncement[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

app.put('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { id } = req.params;
    const { title, content, type, active } = req.body;
    
    await connection.execute(
      'UPDATE announcements SET title = ?, content = ?, type = ?, active = ? WHERE id = ?',
      [title, content, type, active, id]
    );
    
    const [updatedAnnouncement] = await connection.execute(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );
    
    res.json(updatedAnnouncement[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

app.delete('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { id } = req.params;
    await connection.execute('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

app.get('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const [rows] = await connection.execute(
      'SELECT * FROM news_articles ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { title, content, excerpt, published } = req.body;
    const [result] = await connection.execute(
      'INSERT INTO news_articles (title, content, excerpt, published) VALUES (?, ?, ?, ?)',
      [title, content, excerpt || null, published !== undefined ? published : false]
    );
    
    const [newArticle] = await connection.execute(
      'SELECT * FROM news_articles WHERE id = ?',
      [result.insertId]
    );
    
    res.json(newArticle[0]);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

app.put('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { id } = req.params;
    const { title, content, excerpt, published } = req.body;
    
    await connection.execute(
      'UPDATE news_articles SET title = ?, content = ?, excerpt = ?, published = ? WHERE id = ?',
      [title, content, excerpt, published, id]
    );
    
    const [updatedArticle] = await connection.execute(
      'SELECT * FROM news_articles WHERE id = ?',
      [id]
    );
    
    res.json(updatedArticle[0]);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

app.delete('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { id } = req.params;
    await connection.execute('DELETE FROM news_articles WHERE id = ?', [id]);
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

// Initialize database and start server
async function startServer() {
  await initializeDatabase();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Admin Panel: http://localhost:5000/admin');
    console.log('Default admin credentials: admin/admin123');
  });
}

startServer();