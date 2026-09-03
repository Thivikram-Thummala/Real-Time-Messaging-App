import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

/**
 * PostgreSQL connection pool.
 * Uses the DATABASE_URL from .env and configures pool size limits.
 * SSL is enabled when connecting to remote hosts (e.g. Supabase).
 */
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  min: config.DB_POOL_MIN,
  max: config.DB_POOL_MAX,
  // Enable SSL for remote databases (Supabase requires it)
  ssl: config.DATABASE_URL.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected');
});
