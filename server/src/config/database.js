import pg from 'pg';
import { config } from './index.js';
import dns from 'dns';

const { Pool } = pg;

// Force IPv4 DNS resolution globally (critical for Render + Supabase)
dns.setDefaultResultOrder('ipv4first');

const isProductionOrRemote =
  config.NODE_ENV === 'production' ||
  (!config.DATABASE_URL.includes('localhost') && !config.DATABASE_URL.includes('127.0.0.1'));

/**
 * PostgreSQL connection pool.
 * Uses the DATABASE_URL from .env and configures pool size limits.
 * SSL is enabled when connecting to remote hosts (e.g. Render, Supabase).
 * 
 * For Supabase + Render: Force IPv4 via DNS resolver + pool settings
 */
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  min: config.DB_POOL_MIN,
  max: config.DB_POOL_MAX,
  ssl: isProductionOrRemote ? { rejectUnauthorized: false } : false,
  family: 4  // Force IPv4 in connection pool
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected');
});
