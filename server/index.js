const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { pool, createTables } = require('./database'); // Import pool and createTables

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
app.post('/api/texts', authenticateToken, async (req, res) => {
  const { title, synopsis, content, is_private, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO personal_texts (title, synopsis, content, is_private, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, synopsis, content, is_private, password || null]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Personal text created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all personal texts (show only title and synopsis for private ones)
app.get('/api/texts', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, synopsis, is_private FROM personal_texts');
    const texts = result.rows;
    res.json(texts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific personal text
app.get('/api/texts/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.query; // Password can be sent as a query parameter for private texts

  try {
    const result = await pool.query('SELECT id, title, synopsis, content, is_private, password FROM personal_texts WHERE id = $1', [id]);
    const text = result.rows[0];

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
app.put('/api/texts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, synopsis, content, is_private, password } = req.body;
  try {
    const result = await pool.query(
      'UPDATE personal_texts SET title = $1, synopsis = $2, content = $3, is_private = $4, password = $5 WHERE id = $6',
      [title, synopsis, content, is_private, password || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Text not found or no changes made.' });
    }
    res.json({ message: 'Personal text updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a personal text
app.delete('/api/texts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM personal_texts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Text not found.' });
    }
    res.json({ message: 'Personal text deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Parental Alienation Articles Endpoints ---
// Create a new article
app.post('/api/articles', authenticateToken, async (req, res) => {
  const { title, content, author, link } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO parental_alienation_articles (title, content, author, link) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, content, author, link]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Article created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, content, author, link FROM parental_alienation_articles');
    const articles = result.rows;
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific article
app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, title, content, author, link FROM parental_alienation_articles WHERE id = $1', [id]);
    const article = result.rows[0];
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an article
app.put('/api/articles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, author, link } = req.body;
  try {
    const result = await pool.query(
      'UPDATE parental_alienation_articles SET title = $1, content = $2, author = $3, link = $4 WHERE id = $5',
      [title, content, author, link, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Article not found or no changes made.' });
    }
    res.json({ message: 'Article updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an article
app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM parental_alienation_articles WHERE id = $1', [id]);
    if (result.rowCount === 0) {
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

  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [req.user.name]);
  const userId = userResult.rows[0]?.id;
  if (!userId) {
      // This case should ideally not happen if authenticateToken works correctly and user exists
      return res.status(401).json({ message: 'User not found.' });
  }

  try {
    const result = await pool.query('INSERT INTO diary_entries (user_id, filename) VALUES ($1, $2) RETURNING id', [userId, req.file.filename]);
    res.status(201).json({ id: result.rows[0].id, filename: req.file.filename, message: 'Diary entry uploaded successfully.' });
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
app.get('/api/diary/list', authenticateToken, async (req, res) => {
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [req.user.name]);
  const userId = userResult.rows[0]?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }
  try {
    const result = await pool.query('SELECT id, filename, upload_date FROM diary_entries WHERE user_id = $1 ORDER BY upload_date DESC', [userId]);
    const entries = result.rows;
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download a specific diary entry
app.get('/api/diary/download/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [req.user.name]);
  const userId = userResult.rows[0]?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }

  try {
    // Verify that the user owns the file
    const entryResult = await pool.query('SELECT id FROM diary_entries WHERE filename = $1 AND user_id = $2', [filename, userId]);
    const entry = entryResult.rows[0];
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
app.delete('/api/diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [req.user.name]);
  const userId = userResult.rows[0]?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not found.' });
  }

  try {
    // Get filename before deleting from DB to delete the file from disk
    const getResult = await pool.query('SELECT filename FROM diary_entries WHERE id = $1 AND user_id = $2', [id, userId]);
    const entry = getResult.rows[0];

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found or you do not have permission to delete it.' });
    }

    const deleteResult = await pool.query('DELETE FROM diary_entries WHERE id = $1 AND user_id = $2', [id, userId]);

    if (deleteResult.rowCount === 0) {
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
async function initializeAndStartServer() {
  await createTables(); // Call createTables here
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
initializeAndStartServer();
