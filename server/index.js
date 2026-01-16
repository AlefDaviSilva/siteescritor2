const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { put, del } = require('@vercel/blob');
require('dotenv').config();
const { sql, createTables } = require('./database');

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET;

// Middleware global
app.use(cors());
// O bodyParser.json() será aplicado seletivamente
app.use(bodyParser.urlencoded({ extended: true }));

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

const jsonParser = bodyParser.json();

// --- Endpoints ---

// Login
app.post('/api/login', jsonParser, async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await sql`SELECT password_hash FROM users WHERE username = ${username}`;
    const user = users[0];
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const accessToken = jwt.sign({ name: username }, jwtSecret, { expiresIn: '1h' });
      res.json({ accessToken });
    } else {
      res.status(400).json({ message: 'Invalid Credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// --- Personal Texts ---
app.post('/api/texts', jsonParser, authenticateToken, async (req, res) => {
  const rows = await sql`INSERT INTO personal_texts (title, synopsis, content, is_private, password) VALUES (${title}, ${synopsis}, ${content}, ${is_private || false}, ${password || null}) RETURNING id`;
  res.status(201).json({ id: rows[0].id, message: 'Personal text created.' });
});

app.get('/api/texts', async (req, res) => {
  const rows = await sql`SELECT id, title, synopsis, is_private FROM personal_texts`;
  res.json(rows);
});

app.get('/api/texts/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.query;
  const rows = await sql`SELECT * FROM personal_texts WHERE id = ${id}`;
  const text = rows[0];
  if (!text) return res.status(404).json({ message: 'Text not found.' });
  if (text.is_private && (!password || password !== text.password)) {
    return res.status(401).json({ id: text.id, title: text.title, synopsis: text.synopsis, is_private: true, message: 'Password required.' });
  }
  res.json(text);
});

app.put('/api/texts/:id', jsonParser, authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, synopsis, content, is_private, password } = req.body;
  const result = await sql`UPDATE personal_texts SET title = ${title}, synopsis = ${synopsis}, content = ${content}, is_private = ${is_private || false}, password = ${password || null} WHERE id = ${id}`;
  if (result.count === 0) return res.status(404).json({ message: 'Text not found.' });
  res.json({ message: 'Personal text updated.' });
});

app.delete('/api/texts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await sql`DELETE FROM personal_texts WHERE id = ${id}`;
  if (result.count === 0) return res.status(404).json({ message: 'Text not found.' });
  res.json({ message: 'Personal text deleted.' });
});

// --- Articles ---
app.post('/api/articles', jsonParser, authenticateToken, async (req, res) => {
  const rows = await sql`INSERT INTO parental_alienation_articles (title, content, author, link) VALUES (${title}, ${content}, ${author}, ${link}) RETURNING id`;
  res.status(201).json({ id: rows[0].id, message: 'Article created.' });
});

app.get('/api/articles', async (req, res) => {
  const rows = await sql`SELECT * FROM parental_alienation_articles`;
  res.json(rows);
});

app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  const rows = await sql`SELECT * FROM parental_alienation_articles WHERE id = ${id}`;
  if (rows.length === 0) return res.status(404).json({ message: 'Article not found.' });
  res.json(rows[0]);
});

app.put('/api/articles/:id', jsonParser, authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, author, link } = req.body;
  const result = await sql`UPDATE parental_alienation_articles SET title = ${title}, content = ${content}, author = ${author}, link = ${link} WHERE id = ${id}`;
  if (result.count === 0) return res.status(404).json({ message: 'Article not found.' });
  res.json({ message: 'Article updated.' });
});

app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await sql`DELETE FROM parental_alienation_articles WHERE id = ${id}`;
  if (result.count === 0) return res.status(404).json({ message: 'Article not found.' });
  res.json({ message: 'Article deleted.' });
});

// --- Diary ---
app.post('/api/diary/upload', authenticateToken, async (req, res) => {
  const filename = req.headers['x-vercel-filename'];
  if (!filename) {
    return res.status(400).json({ message: 'x-vercel-filename header is required.' });
  }
  try {
    const blob = await put(filename, req, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
    const users = await sql`SELECT id FROM users WHERE username = ${req.user.name}`;
    const userId = users[0]?.id;
    if (!userId) return res.status(401).json({ message: 'User not found.' });
    const rows = await sql`INSERT INTO diary_entries (user_id, url) VALUES (${userId}, ${blob.url}) RETURNING *`;
    res.status(201).json({ ...rows[0], message: 'Diary entry uploaded.' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file.', error: error.message });
  }
});

app.get('/api/diary/list', authenticateToken, async (req, res) => {
  const users = await sql`SELECT id FROM users WHERE username = ${req.user.name}`;
  const userId = users[0]?.id;
  if (!userId) return res.status(401).json({ message: 'User not found.' });
  const rows = await sql`SELECT * FROM diary_entries WHERE user_id = ${userId} ORDER BY upload_date DESC`;
  res.json(rows);
});

app.delete('/api/diary/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const users = await sql`SELECT id FROM users WHERE username = ${req.user.name}`;
    const userId = users[0]?.id;
    if (!userId) return res.status(401).json({ message: 'User not found.' });
    const entries = await sql`SELECT url FROM diary_entries WHERE id = ${id} AND user_id = ${userId}`;
    if (entries.length === 0) return res.status(404).json({ message: 'Diary entry not found.' });
    if (entries[0].url) {
      await del(entries[0].url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }
    const result = await sql`DELETE FROM diary_entries WHERE id = ${id} AND user_id = ${userId}`;
    res.json({ message: 'Diary entry deleted.' });
});

app.get('/', (req, res) => res.send('Backend is running.'));

// Server startup
const startServer = async () => {
  try {
    await createTables();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();