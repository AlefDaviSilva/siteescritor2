const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS personal_texts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      synopsis TEXT,
      content TEXT,
      is_private BOOLEAN DEFAULT 0,
      password TEXT -- This will store a plain text password for now, consider hashing later for individual text passwords
    );

    CREATE TABLE IF NOT EXISTS parental_alienation_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      author TEXT,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('Database tables created or already exist.');

  // Insert default admin user if not exists
  const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?');
  const admin = checkAdmin.get(process.env.ADMIN_USERNAME);

  if (!admin) {
    const insertAdmin = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    insertAdmin.run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD_HASH);
    console.log('Default admin user inserted.');
  }
};

module.exports = {
  db,
  createTables
};
