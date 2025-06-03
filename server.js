const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
    const result = await pool.query(
      'SELECT * FROM announcements WHERE active = true ORDER BY "createdAt" DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE published = true ORDER BY "createdAt" DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/training-programs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM training_programs WHERE active = true ORDER BY "createdAt" DESC'
    );
    res.json(result.rows);
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
    // In production, you would implement actual Minecraft server status checking
    const status = {
      online: false,
      error: "Server status checking not implemented in simplified version"
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
  const { username, password } = req.body;
  
  // Simple admin credentials check
  if (username === 'admin' && password === 'admin123') {
    const sessionId = Math.random().toString(36).substring(7);
    adminSessions.set(sessionId, { username: 'admin', role: 'admin' });
    
    res.json({
      sessionId,
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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
    const result = await pool.query('SELECT id, username, role, "createdAt" FROM users ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/admin/announcements', isAuthenticated, async (req, res) => {
  try {
    const { title, content, type, active } = req.body;
    const result = await pool.query(
      'INSERT INTO announcements (title, content, type, active, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [title, content, type, active]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

app.put('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, active } = req.body;
    const result = await pool.query(
      'UPDATE announcements SET title = $1, content = $2, type = $3, active = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [title, content, type, active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

app.delete('/api/admin/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

app.get('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news_articles ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/admin/news', isAuthenticated, async (req, res) => {
  try {
    const { title, content, excerpt, published } = req.body;
    const result = await pool.query(
      'INSERT INTO news_articles (title, content, excerpt, published, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [title, content, excerpt, published]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

app.put('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, published } = req.body;
    const result = await pool.query(
      'UPDATE news_articles SET title = $1, content = $2, excerpt = $3, published = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [title, content, excerpt, published, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

app.delete('/api/admin/news/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM news_articles WHERE id = $1', [id]);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});