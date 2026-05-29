import { Pool } from "pg";
import 'dotenv/config';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL');
  release();
});

/**
 * Run this once to set up the database schema.
 * Call `node src/db/init.js` to create the table.
 */
async function initSchema() {
  await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         VARCHAR(255) UNIQUE NOT NULL,
      username      VARCHAR(50)  UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS urls (
      id          SERIAL PRIMARY KEY,
      code        VARCHAR(20) UNIQUE NOT NULL,
      original    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at  TIMESTAMPTZ,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id         SERIAL PRIMARY KEY,
      url_id     INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_urls_code ON urls(code);
    CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_url_id    ON clicks(url_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at); 
  `);
  console.log('Schema ready');
}

export { pool, initSchema };
