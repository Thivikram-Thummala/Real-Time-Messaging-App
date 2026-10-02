import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL_TEST

const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function seed() {
    console.log('🌱 Seeding 100,000 messages for Pagination Benchmark...');
    try {
        // 1. Create Test User & Test Room
        await pool.query(`
      INSERT INTO users (id, username, email, password_hash)
      VALUES ('00000000-0000-0000-0000-000000000001', 'page_user', 'page@test.com', 'hash')
      ON CONFLICT (id) DO NOTHING;
    `);

        await pool.query(`
      INSERT INTO rooms (id, name, is_private)
      VALUES ('00000000-0000-0000-0000-000000000201', 'Pagination Test Room', false)
      ON CONFLICT (id) DO NOTHING;
    `);

        // 2. Insert 100,000 Messages
        console.log('Generating 100,000 messages...');
        await pool.query(`
      INSERT INTO messages (room_id, sender_id, content, message_type)
      SELECT 
        '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000001',
        'Pagination test message #' || g.i,
        'text'
      FROM generate_series(1, 100000) AS g(i);
    `);

        console.log('✅ Seeding complete! 100,000 messages inserted into Pagination Test Room.');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await pool.end();
    }
}

seed();
