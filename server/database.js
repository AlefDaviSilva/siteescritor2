const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.POSTGRES_URL);

const createTables = async () => {
  try {
    // A Vercel já lida com a conexão através das variáveis de ambiente.
    console.log('Checking for database tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS personal_texts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        synopsis TEXT,
        content TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        password VARCHAR(255)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS parental_alienation_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        author VARCHAR(255),
        link TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        url TEXT NOT NULL, -- Changed from filename to url for Vercel Blob
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    console.log('Database tables created or already exist.');

    // Insert default admin user if not exists
    const users = await sql`SELECT id FROM users WHERE username = ${process.env.ADMIN_USERNAME}`;
    
    if (users.length === 0) {
      await sql`
        INSERT INTO users (username, password_hash) 
        VALUES (${process.env.ADMIN_USERNAME}, ${process.env.ADMIN_PASSWORD_HASH})
      `;
      console.log('Default admin user inserted.');
    }
  } catch (error) {
    console.error('Error creating database tables:', error);
    // Em um ambiente de produção, você pode querer lançar o erro
    // para impedir que o servidor inicie com um estado de DB inválido.
    throw error;
  }
};

module.exports = {
  sql,
  createTables
};