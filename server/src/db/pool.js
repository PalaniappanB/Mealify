const { Pool } = require('pg');
require('dotenv').config();

const isLocalHost = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted providers (Supabase, Neon, RDS, ...) require SSL; local dev doesn't.
  ssl: isLocalHost ? false : { rejectUnauthorized: false }
});

module.exports = pool;
