import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

const isProductionOrRemote =
  config.NODE_ENV === 'production' ||
  (!config.DATABASE_URL.includes('localhost') && !config.DATABASE_URL.includes('127.0.0.1'));

/**
 * PostgreSQL connection pool.
 * Uses the DATABASE_URL from .env and configures pool size limits.
 * SSL is enabled when connecting to remote hosts (e.g. Render, Supabase).
 */
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  min: config.DB_POOL_MIN,
  max: config.DB_POOL_MAX,
  ssl: isProductionOrRemote ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected');
});
