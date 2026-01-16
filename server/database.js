const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS personal_texts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        synopsis TEXT,
        content TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS parental_alienation_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        author TEXT,
        link TEXT
      );

      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Database tables created or already exist.');

    // Insert default admin user if not exists
    const checkAdmin = await pool.query('SELECT id FROM users WHERE username = $1', [process.env.ADMIN_USERNAME]);
    const admin = checkAdmin.rows[0];

    if (!admin) {
      await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD_HASH]);
      console.log('Default admin user inserted.');
    }
  } catch (error) {
    console.error('Error creating tables or inserting admin user:', error);
  }
};

module.exports = {
  pool,
  createTables
};
