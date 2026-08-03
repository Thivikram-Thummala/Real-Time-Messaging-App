import http from 'http';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const TARGET_REQUESTS = parseInt(process.env.TARGET_REQUESTS || '1000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '50', 10);
const STEP_DELAY_MS = parseInt(process.env.STEP_DELAY_MS || '50', 10);

let successCount = 0;
let errorCount = 0;

console.log(`\n======================================================`);
console.log(`⚡ REST API LOAD TESTER: 1,000 HTTP POST REQUESTS`);
console.log(`======================================================`);
console.log(` Target Server:       ${SERVER_URL}`);
console.log(` Target Requests:     ${TARGET_REQUESTS}`);
console.log(` Batch Size:          ${BATCH_SIZE} req / step`);
console.log(` Step Delay:          ${STEP_DELAY_MS} ms`);
console.log(` Auth Header:         Bearer LOAD_TEST_BYPASS`);
console.log(`======================================================\n`);

function sendHttpRequest(index) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      content: `Load test REST message #${index + 1}`
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/rooms/00000000-0000-0000-0000-000000000000/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer LOAD_TEST_BYPASS',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        successCount++;
        resolve(true);
      } else {
        errorCount++;
        resolve(false);
      }
    });

    req.on('error', () => {
      errorCount++;
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function startHttpLoadTest() {
  const startTime = Date.now();

  for (let i = 0; i < TARGET_REQUESTS; i += BATCH_SIZE) {
    const batchPromises = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TARGET_REQUESTS; j++) {
      batchPromises.push(sendHttpRequest(i + j));
    }
    await Promise.all(batchPromises);

    process.stdout.write(`\r📊 HTTP Requests Sent: ${successCount}/${TARGET_REQUESTS} | Errors: ${errorCount}`);
    await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const rps = (TARGET_REQUESTS / parseFloat(duration)).toFixed(1);

  console.log(`\n\n======================================================`);
  console.log(`🎉 HTTP REST LOAD TEST COMPLETED IN ${duration} SECONDS`);
  console.log(`======================================================`);
  console.log(` ✅ Successful Requests: ${successCount}`);
  console.log(` ❌ Failed Requests:     ${errorCount}`);
  console.log(` 🚀 Throughput:          ${rps} req/sec`);
  console.log(` 📈 Success Rate:        ${((successCount / TARGET_REQUESTS) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  process.exit(0);
}

startHttpLoadTest().catch((err) => {
  console.error('Fatal HTTP load test error:', err);
  process.exit(1);
});
