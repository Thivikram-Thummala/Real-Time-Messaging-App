import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple migration runner.
 * Reads all .sql files from the migrations/ directory (sorted alphabetically)
 * and executes them against the PostgreSQL database.
 */
async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');

  console.log('🔄 Starting database migration...');
  console.log(`   Reading from: ${migrationsDir}`);

  try {
    // Read and sort migration files
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found.');
      await pool.end();
      return;
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`   Running: ${file}...`);
      await pool.query(sql);
      console.log(`   ✅ ${file} — applied successfully`);
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
