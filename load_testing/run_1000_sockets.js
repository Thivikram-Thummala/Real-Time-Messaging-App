import { io } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const TARGET_CONNECTIONS = parseInt(process.env.TARGET_CONNECTIONS || '1000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '50', 10);
const STEP_DELAY_MS = parseInt(process.env.STEP_DELAY_MS || '100', 10);

let connectedCount = 0;
let errorCount = 0;
const sockets = [];

console.log(`\n======================================================`);
console.log(`⚡ REAL-TIME CHAT LOAD TESTER: 1,000 CONCURRENT USERS`);
console.log(`======================================================`);
console.log(` Target Server:       ${SERVER_URL}`);
console.log(` Target Connections:  ${TARGET_CONNECTIONS}`);
console.log(` Batch Size:          ${BATCH_SIZE} sockets / step`);
console.log(` Step Delay:          ${STEP_DELAY_MS} ms`);
console.log(` Auth Method:         Bypass Token (LOAD_TEST_BYPASS)`);
console.log(`======================================================\n`);

function createClientSocket(index) {
  return new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      auth: { token: 'LOAD_TEST_BYPASS' },
      transports: ['websocket'],
      reconnection: false
    });

    socket.on('connect', () => {
      connectedCount++;
      sockets.push(socket);
      resolve(true);
    });

    socket.on('connect_error', (err) => {
      errorCount++;
      resolve(false);
    });
  });
}

async function startLoadTest() {
  const startTime = Date.now();

  for (let i = 0; i < TARGET_CONNECTIONS; i += BATCH_SIZE) {
    const batchPromises = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TARGET_CONNECTIONS; j++) {
      batchPromises.push(createClientSocket(i + j));
    }
    await Promise.all(batchPromises);

    process.stdout.write(`\r📊 Connections: ${connectedCount}/${TARGET_CONNECTIONS} | Errors: ${errorCount}`);
    await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\n======================================================`);
  console.log(`🎉 LOAD TEST COMPLETED IN ${duration} SECONDS`);
  console.log(`======================================================`);
  console.log(` ✅ Successful Sockets: ${connectedCount}`);
  console.log(` ❌ Failed Connections: ${errorCount}`);
  console.log(` 📈 Success Rate:       ${((connectedCount / TARGET_CONNECTIONS) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  console.log('Holding 1,000 connections open for 15 seconds to monitor stability...');
  await new Promise((r) => setTimeout(r, 15000));

  console.log('\nClosing all 1,000 socket connections...');
  sockets.forEach((s) => s.disconnect());
  console.log('✅ Cleanup complete. Exiting load test.');
  process.exit(0);
}

startLoadTest().catch((err) => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
