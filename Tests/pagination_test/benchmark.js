import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    max: 20, // Sets maximum pool size to 20 connections
    ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

const ROOM_ID = '00000000-0000-0000-0000-000000000201';

async function runBenchmark() {
    console.log('==================================================');
    console.log('🚀 PAGINATION BENCHMARK (100,000 Messages Dataset)');
    console.log('==================================================\n');

    try {
        // ----------------------------------------------------
        // TEST 1: Load All History at Once
        // ----------------------------------------------------
        console.log('⏳ Test 1: Loading ALL 100,000 messages at once...');
        const startAll = performance.now();
        const resAll = await pool.query(
            `SELECT * FROM messages WHERE room_id = $1 ORDER BY id DESC`,
            [ROOM_ID]
        );
        const endAll = performance.now();
        const timeAll = (endAll - startAll).toFixed(2);
        const rowsFetchedAll = resAll.rows.length;
        // Estimate payload size in MB
        const payloadMB = (JSON.stringify(resAll.rows).length / (1024 * 1024)).toFixed(2);

        // ----------------------------------------------------
        // TEST 2: Offset Pagination (Deep Page: OFFSET 99,900)
        // ----------------------------------------------------
        console.log('⏳ Test 2: Offset Pagination (Deep Page 2,000 - OFFSET 99,900 LIMIT 50)...');
        const startOffset = performance.now();
        const resOffset = await pool.query(
            `SELECT * FROM messages WHERE room_id = $1 ORDER BY id DESC LIMIT 50 OFFSET 99900`,
            [ROOM_ID]
        );
        const endOffset = performance.now();
        const timeOffset = (endOffset - startOffset).toFixed(2);

        // Get the cursor ID from the 99,900th message for Test 3
        const cursorId = resOffset.rows[0]?.id || 100;

        // ----------------------------------------------------
        // TEST 3: Cursor Pagination (Deep Page - WHERE id < $cursor)
        // ----------------------------------------------------
        console.log('⏳ Test 3: Cursor Pagination (Deep Page - WHERE id < $cursor LIMIT 50)...');
        const startCursor = performance.now();
        const resCursor = await pool.query(
            `SELECT * FROM messages WHERE room_id = $1 AND id < $2 ORDER BY id DESC LIMIT 50`,
            [ROOM_ID, cursorId]
        );
        const endCursor = performance.now();
        const timeCursor = (endCursor - startCursor).toFixed(2);

        // ----------------------------------------------------
        // RESULTS SUMMARY TABLE
        // ----------------------------------------------------
        console.log('\n==================================================');
        console.log('📊 BENCHMARK RESULTS SUMMARY');
        console.log('==================================================');
        console.table({
            '1. Load All History': {
                'Execution Time': `${timeAll} ms`,
                'Rows Fetched': rowsFetchedAll,
                'Payload Data Size': `${payloadMB} MB`,
                'Algorithmic Complexity': 'O(N) - Loads entire table into RAM'
            },
            '2. Offset Pagination (Page 2000)': {
                'Execution Time': `${timeOffset} ms`,
                'Rows Fetched': resOffset.rows.length,
                'Payload Data Size': '~0.01 MB',
                'Algorithmic Complexity': 'O(N) - Scans & drops 99,900 index tuples'
            },
            '3. Cursor Pagination (Page 2000)': {
                'Execution Time': `${timeCursor} ms`,
                'Rows Fetched': resCursor.rows.length,
                'Payload Data Size': '~0.01 MB',
                'Algorithmic Complexity': 'O(log K + M) - Direct B-Tree seek'
            }
        });

        const speedupVsAll = (timeAll / timeCursor).toFixed(1);
        const speedupVsOffset = (timeOffset / timeCursor).toFixed(1);

        console.log(`\n🎉 Cursor Pagination is ~${speedupVsOffset}x FASTER than Offset Pagination at deep pages!`);
        console.log(`🎉 Cursor Pagination is ~${speedupVsAll}x FASTER than Loading All History at once!`);

    } catch (err) {
        console.error('❌ Benchmark Error:', err);
    } finally {
        await pool.end();
    }
}

runBenchmark();
