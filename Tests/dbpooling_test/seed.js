import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback



const { Pool } = pg;

// Connect using your database URL (Supabase or Local)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_TEST,
  ssl: process.env.DATABASE_URL_TEST?.includes('localhost') || process.env.DATABASE_URL_TEST?.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false }
});

async function seed() {
  console.log('🌱 Starting database seeding for DB Pooling benchmark...');

  try {
    // 1. Insert 5 Test Users
    console.log('Creating test users...');
    for (let i = 1; i <= 5; i++) {
      await pool.query(`
        INSERT INTO users (id, username, email, password_hash)
        VALUES ($1, $2, $3, 'hash')
        ON CONFLICT (id) DO NOTHING;
      `, [`00000000-0000-0000-0000-00000000000${i}`, `pool_user_${i}`, `pool_user_${i}@test.com`]);
    }

    // 2. Insert 2 Test Rooms
    console.log('Creating test rooms...');
    await pool.query(`
      INSERT INTO rooms (id, name, is_private)
      VALUES 
        ('00000000-0000-0000-0000-000000000101', 'Pool Test Room 1', false),
        ('00000000-0000-0000-0000-000000000102', 'Pool Test Room 2', false)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Insert 300 Test Messages
    console.log('Inserting 300 messages...');
    await pool.query(`
      INSERT INTO messages (room_id, sender_id, content, message_type)
      SELECT 
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        'Pooling test message content #' || g.i,
        'text'
      FROM generate_series(1, 300) AS g(i);
    `);

    console.log('✅ Seeding complete! 300 messages ready for benchmarking.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
