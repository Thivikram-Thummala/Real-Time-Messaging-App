import http from 'http';
import { io } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const NUM_RECEIVERS = parseInt(process.env.NUM_RECEIVERS || '100', 10);
const TOTAL_MESSAGES = parseInt(process.env.TOTAL_MESSAGES || '500', 10);
const MSG_INTERVAL_MS = parseInt(process.env.MSG_INTERVAL_MS || '20', 10);

let roomId = null;
let receivers = [];
let totalSent = 0;
let totalReceived = 0;
let e2eLatencies = [];

console.log(`\n======================================================`);
console.log(`⚡ REAL-TIME END-TO-END (E2E) MESSAGE BENCHMARK`);
console.log(`======================================================`);
console.log(` Target Server:       ${SERVER_URL}`);
console.log(` Receiver Sockets:    ${NUM_RECEIVERS}`);
console.log(` Total Messages:      ${TOTAL_MESSAGES}`);
console.log(` Dispatch Interval:   ${MSG_INTERVAL_MS} ms`);
console.log(` Auth Header:         Bearer LOAD_TEST_BYPASS`);
console.log(`======================================================\n`);

// Helper to make HTTP POST requests
function httpRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer LOAD_TEST_BYPASS',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function calculatePercentile(arr, p) {
  if (arr.length === 0) return '0.0';
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)].toFixed(1);
}

async function runE2ETest() {
  // 1. Create a Room in the Database via REST API
  console.log('1️⃣ Creating benchmark room in database...');
  const roomRes = await httpRequest('/api/v1/rooms', {
    name: `E2E Benchmark Room ${Date.now()}`,
    description: 'Load test room for E2E message delivery',
    isPrivate: false
  });

  if (roomRes.status !== 201 || !roomRes.body.data?.id) {
    console.error('❌ Failed to create benchmark room:', roomRes.body);
    process.exit(1);
  }

  roomId = roomRes.body.data.id;
  console.log(`   ✅ Benchmark Room Created! Room UUID: ${roomId}\n`);

  // 2. Connect Receiver Sockets & Join Room Channel
  console.log(`2️⃣ Spawning ${NUM_RECEIVERS} receiver sockets and joining room...`);
  for (let i = 0; i < NUM_RECEIVERS; i++) {
    const socket = io(SERVER_URL, {
      auth: { token: 'LOAD_TEST_BYPASS' },
      transports: ['websocket'],
      reconnection: false
    });

    socket.on('connect', () => {
      socket.emit('room:join', { roomId });
    });

    socket.on('message:new', (payload) => {
      const recvTime = performance.now();
      if (payload && payload.content) {
        const match = payload.content.match(/\[SentAt:(.*?)\]/);
        if (match && match[1]) {
          const sentAt = parseFloat(match[1]);
          const latency = recvTime - sentAt;
          e2eLatencies.push(latency);
          totalReceived++;
        }
      }
    });

    receivers.push(socket);
  }

  // Wait 1.5s for all receiver sockets to connect and join room
  await new Promise(r => setTimeout(r, 1500));
  console.log(`   ✅ All ${receivers.length} receivers connected and joined room ${roomId}\n`);

  // 3. Dispatch Messages via REST API
  console.log(`3️⃣ Dispatching ${TOTAL_MESSAGES} messages to REST endpoint /api/v1/rooms/${roomId}/messages...`);
  const startTime = Date.now();

  for (let i = 0; i < TOTAL_MESSAGES; i++) {
    const sentAt = performance.now();
    const content = `E2E Benchmark Message #${i + 1} [SentAt:${sentAt}]`;
    
    // We attach _sentAt to test content payload
    await httpRequest(`/api/v1/rooms/${roomId}/messages`, {
      content: content
    });

    totalSent++;
    process.stdout.write(`\r📊 Messages Sent: ${totalSent}/${TOTAL_MESSAGES} | E2E Broadcasts Received: ${totalReceived}`);
    await new Promise(r => setTimeout(r, MSG_INTERVAL_MS));
  }

  // Wait 2 seconds for final broadcast propagation
  await new Promise(r => setTimeout(r, 2000));
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  // 4. Report Final E2E Results
  console.log(`\n\n======================================================`);
  console.log(`🎉 END-TO-END (E2E) BENCHMARK REPORT`);
  console.log(`======================================================`);
  console.log(` 💬 Room UUID:              ${roomId}`);
  console.log(` ⏱️  Total Duration:         ${totalDuration} seconds`);
  console.log(` 📤 REST Messages Sent:     ${totalSent}`);
  console.log(` 📥 Total Sockets Delivered: ${totalReceived} (across ${NUM_RECEIVERS} clients)`);
  console.log(` 🚀 E2E Delivery Rate:       ${totalSent > 0 ? ((totalReceived / (totalSent * NUM_RECEIVERS)) * 100).toFixed(1) : 0}%`);
  console.log(`------------------------------------------------------`);
  console.log(` ⚡ E2E Latency Stats (Client ➔ Server DB ➔ Room Broadcast):`);
  console.log(`    • Average Latency:     ${e2eLatencies.length ? (e2eLatencies.reduce((a,b)=>a+b,0)/e2eLatencies.length).toFixed(1) : 0} ms`);
  console.log(`    • Min Latency:         ${e2eLatencies.length ? Math.min(...e2eLatencies).toFixed(1) : 0} ms`);
  console.log(`    • Max Latency:         ${e2eLatencies.length ? Math.max(...e2eLatencies).toFixed(1) : 0} ms`);
  console.log(`    • p95 Latency:         ${calculatePercentile(e2eLatencies, 95)} ms`);
  console.log(`    • p99 Latency:         ${calculatePercentile(e2eLatencies, 99)} ms`);
  console.log(`======================================================\n`);

  // Cleanup
  receivers.forEach(s => s.disconnect());
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('Fatal E2E test error:', err);
  process.exit(1);
});
