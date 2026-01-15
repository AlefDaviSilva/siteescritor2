const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { db, createTables } = require('./database'); // Import db and createTables

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer storage for diary entries
const diaryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/diary');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadDiary = multer({ storage: diaryStorage });


// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === adminUsername && await bcrypt.compare(password, adminPasswordHash)) {
    const user = { name: username };
    const accessToken = jwt.sign(user, jwtSecret, { expiresIn: '1h' });
    res.json({ accessToken: accessToken });
  } else {
    res.status(400).json({ message: 'Invalid Credentials' });
  }
});

// --- Personal Texts Endpoints ---
// Create a new personal text
app.post('/api/texts', authenticateToken, (req, res) => {
  const { title, synopsis, content, is_private, password } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO personal_texts (title, synopsis, content, is_private, password) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, synopsis, content, is_private ? 1 : 0, password || null);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Personal text created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all personal texts (show only title and synopsis for private ones)
app.get('/api/texts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, title, synopsis, is_private FROM personal_texts');
    const texts = stmt.all();
    res.json(texts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific personal text
app.get('/api/texts/:id', (req, res) => {
  const { id } = req.params;
  const { password } = req.query; // Password can be sent as a query parameter for private texts

  try {
    const stmt = db.prepare('SELECT id, title, synopsis, content, is_private, password FROM personal_texts WHERE id = ?');
    const text = stmt.get(id);

    if (!text) {
      return res.status(404).json({ message: 'Text not found.' });
    }

    if (text.is_private) {
      if (!password || password !== text.password) {
        // Return only title and synopsis if private and password is not provided or incorrect
        return res.status(401).json({ id: text.id, title: text.title, synopsis: text.synopsis, is_private: true, message: 'Password required for this text.' });
      }
    }
    // If public, or private with correct password, return full content
    res.json({ id: text.id, title: text.title, synopsis: text.synopsis, content: text.content, is_private: text.is_private });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a personal text
app.put('/api/texts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, synopsis, content, is_private, password } = req.body;
  try {
    const stmt = db.prepare('UPDATE personal_texts SET title = ?, synopsis = ?, content = ?, is_private = ?, password = ? WHERE id = ?');
    const info = stmt.run(title, synopsis, content, is_private ? 1 : 0, password || null, id);
    if (info.changes === 0) {
      return res.status(404).json({ message: 'Text not found or no changes made.' });
    }
    res.json({ message: 'Personal text updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a personal text
app.delete('/api/texts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM personal_texts WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ message: 'Text not found.' });
    }
    res.json({ message: 'Personal text deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Parental Alienation Articles Endpoints ---
// Create a new article
app.post('/api/articles', authenticateToken, (req, res) => {
  const { title, content, author, link } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO parental_alienation_articles (title, content, author, link) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, content, author, link);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Article created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles
app.get('/api/articles', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, title, content, author, link FROM parental_alienation_articles');
    const articles = stmt.all();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific article
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT id, title, content, author, link FROM parental_alienation_articles WHERE id = ?');
    const article = stmt.get(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an article
app.put('/api/articles/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, author, link } = req.body;
  try {
    const stmt = db.prepare('UPDATE parental_alienation_articles SET title = ?, content = ?, author = ?, link = ? WHERE id = ?');
    const info = stmt.run(title, content, author, link, id);
    if (info.changes === 0) {
      return res.status(404).json({ message: 'Article not found or no changes made.' });
    }
    res.json({ message: 'Article updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an article
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM parental_alienation_articles WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Diary Endpoints ---
// Upload a new diary entry (docx file)
app.post('/api/diary/upload', authenticateToken, uploadDiary.single('diaryFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(req.user.name).id;
  if (!userId) {
      // This case should ideally not happen if authenticateToken works correctly and user exists
      return res.status(401).json({ message: 'User not found.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO diary_entries (user_id, filename) VALUES (?, ?)');
    const info = stmt.run(userId, req.file.filename);
    res.status(201).json({ id: info.lastInsertRowid, filename: req.file.filename, message: 'Diary entry uploaded successfully.' });
  } catch (error) {
    // If database insertion fails, delete the uploaded file
    const fs = require('fs');
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err);
    });
    res.status(500).json({ error: error.message });
  }
});

// List all diary entries
app.get('/api/diary/list', authenticateToken, (req, res) => {
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(req.user.name).id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }
  try {
    const stmt = db.prepare('SELECT id, filename, upload_date FROM diary_entries WHERE user_id = ? ORDER BY upload_date DESC');
    const entries = stmt.all(userId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download a specific diary entry
app.get('/api/diary/download/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(req.user.name).id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }

  try {
    // Verify that the user owns the file
    const stmt = db.prepare('SELECT id FROM diary_entries WHERE filename = ? AND user_id = ?');
    const entry = stmt.get(filename, userId);
    if (!entry) {
      return res.status(404).json({ message: 'File not found or you do not have permission to download it.' });
    }

    const filePath = path.join(__dirname, 'uploads', 'diary', filename);
    res.download(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ message: 'File not found on server.' });
        }
        res.status(500).json({ message: 'Error downloading file.', error: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a diary entry
app.delete('/api/diary/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(req.user.name).id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }

  try {
    // Get filename before deleting from DB to delete the file from disk
    const getStmt = db.prepare('SELECT filename FROM diary_entries WHERE id = ? AND user_id = ?');
    const entry = getStmt.get(id, userId);

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found or you do not have permission to delete it.' });
    }

    const stmt = db.prepare('DELETE FROM diary_entries WHERE id = ? AND user_id = ?');
    const info = stmt.run(id, userId);

    if (info.changes === 0) {
      return res.status(404).json({ message: 'Diary entry not found or no changes made.' });
    }

    // Delete the actual file from disk
    const fs = require('fs');
    const filePath = path.join(__dirname, 'uploads', 'diary', entry.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file from disk:', err);
    });

    res.json({ message: 'Diary entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Example of a protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.name}! This is a protected route.`);
});

// Initialize database and start server
createTables(); // Call createTables here
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
