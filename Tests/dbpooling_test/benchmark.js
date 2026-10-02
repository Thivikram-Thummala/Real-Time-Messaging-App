import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback



const { Client, Pool } = pg;
const connectionString = process.env.DATABASE_URL_TEST;
const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
const sslConfig = isLocal ? false : { rejectUnauthorized: false };

const CONCURRENT_QUERIES = 50; // Number of simultaneous queries to test

// Helper to calculate statistics
function calculateStats(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || max;
  return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), p95: p95.toFixed(2) };
}

// ----------------------------------------------------
// 1. TEST WITHOUT POOLING (New Client per query)
// ----------------------------------------------------
async function testWithoutPooling() {
  console.log(`\n⏳ Running Scenario A: WITHOUT Connection Pooling (${CONCURRENT_QUERIES} concurrent queries)...`);
  const latencies = [];
  const startTime = Date.now();

  const tasks = Array.from({ length: CONCURRENT_QUERIES }).map(async () => {
    const qStart = performance.now();

    // Create connection, handshake, query, and close
    const client = new Client({ connectionString, ssl: sslConfig });
    try {
      await client.connect();
      await client.query('SELECT * FROM messages WHERE room_id = $1 LIMIT 10', ['00000000-0000-0000-0000-000000000101']);
    } finally {
      await client.end().catch(() => { });
    }

    const qEnd = performance.now();
    latencies.push(qEnd - qStart);
  });

  await Promise.all(tasks);
  const totalTime = Date.now() - startTime;
  return { totalTime, stats: calculateStats(latencies) };
}

// ----------------------------------------------------
// 2. TEST WITH POOLING (Reusing pg.Pool)
// ----------------------------------------------------
async function testWithPooling() {
  console.log(`\n⏳ Running Scenario B: WITH Connection Pooling (${CONCURRENT_QUERIES} concurrent queries)...`);
  const pool = new Pool({
    connectionString,
    min: 2,
    max: 20,
    ssl: sslConfig
  });

  const latencies = [];
  const startTime = Date.now();

  const tasks = Array.from({ length: CONCURRENT_QUERIES }).map(async () => {
    const qStart = performance.now();

    // Checkout existing warm connection, query, release
    await pool.query('SELECT * FROM messages WHERE room_id = $1 LIMIT 10', ['00000000-0000-0000-0000-000000000101']);

    const qEnd = performance.now();
    latencies.push(qEnd - qStart);
  });

  await Promise.all(tasks);
  const totalTime = Date.now() - startTime;
  await pool.end();

  return { totalTime, stats: calculateStats(latencies) };
}

// ----------------------------------------------------
// MAIN BENCHMARK RUNNER
// ----------------------------------------------------
async function runBenchmark() {
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in environment variables (.env).');
    process.exit(1);
  }

  console.log('==================================================');
  console.log('🚀 DATABASE CONNECTION POOLING BENCHMARK');
  console.log(`Target DB: ${isLocal ? 'Local PostgreSQL' : 'Supabase (Remote Cloud)'}`);
  console.log('==================================================');

  try {
    const withoutPoolResults = await testWithoutPooling();
    const withPoolResults = await testWithPooling();

    console.log('\n==================================================');
    console.log('📊 BENCHMARK RESULTS SUMMARY');
    console.log('==================================================');
    console.table({
      'Without Pooling (New Client)': {
        'Total Batch Time': `${withoutPoolResults.totalTime} ms`,
        'Avg Latency': `${withoutPoolResults.stats.avg} ms`,
        'p95 Latency': `${withoutPoolResults.stats.p95} ms`,
        'Min Latency': `${withoutPoolResults.stats.min} ms`,
        'Max Latency': `${withoutPoolResults.stats.max} ms`,
      },
      'With Pooling (pg.Pool)': {
        'Total Batch Time': `${withPoolResults.totalTime} ms`,
        'Avg Latency': `${withPoolResults.stats.avg} ms`,
        'p95 Latency': `${withPoolResults.stats.p95} ms`,
        'Min Latency': `${withPoolResults.stats.min} ms`,
        'Max Latency': `${withPoolResults.stats.max} ms`,
      }
    });

    const speedup = (withoutPoolResults.stats.avg / withPoolResults.stats.avg).toFixed(1);
    console.log(`\n🎉 Connection Pooling made your queries ~${speedup}x FASTER!`);

  } catch (err) {
    console.error('❌ Benchmark error:', err);
  }
}

runBenchmark();
