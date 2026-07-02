/**
 * Postgres connection + schema setup (designed for Neon, but works with any
 * standard Postgres connection string).
 *
 * Storage model: every "collection" (users, students, attendance, etc.) is
 * stored as JSONB rows in one shared `records` table, keyed by
 * (collection, id). A separate `counters` table hands out auto-incrementing
 * ids per collection. This keeps the exact same flexible, schema-less feel
 * the JSON-file version had (so utils/store.js and every route file barely
 * had to change), while giving us a REAL database underneath: safe
 * concurrent writes, true persistence independent of any server's local
 * disk, and a generous free tier on Neon that never expires.
 */
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in your .env file. See .env.example.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon (and most managed Postgres hosts) require SSL.
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      collection TEXT NOT NULL,
      id INTEGER NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (collection, id)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counters (
      collection TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
  `);
  // Speeds up "WHERE collection = $1" scans, which is every query we run.
  await pool.query(`CREATE INDEX IF NOT EXISTS records_collection_idx ON records (collection);`);
}

// Wipes every row from both tables. Used only by seed.js to reset to a
// known clean state before re-seeding sample data.
async function clearAll() {
  await pool.query('TRUNCATE TABLE records;');
  await pool.query('TRUNCATE TABLE counters;');
}

module.exports = { pool, initDB, clearAll };
