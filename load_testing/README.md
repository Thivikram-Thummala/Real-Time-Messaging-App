# ⚡ Complete Load Testing & Performance Guide

This directory contains a complete load testing suite designed to help you test the performance, throughput, and latency of **ANY API endpoint or WebSocket event** at any stage of development.

---

## 📋 Table of Contents
1. [⚡ Quick Start (Run a Test in 1 Minute)](#-quick-start-run-a-test-in-1-minute)
2. [🎨 Method 1: Web-Based Latency Visualizer GUI](#-method-1-web-based-latency-visualizer-gui)
3. [🛠️ Method 2: Testing ANY REST API Endpoint (Step-by-Step)](#️-method-2-testing-any-rest-api-endpoint-step-by-step)
4. [📡 Method 3: Testing ANY WebSocket Event (Step-by-Step)](#-method-3-testing-any-websocket-event-step-by-step)
5. [📈 Method 4: Artillery Load Testing & HTML Reports](#-method-4-artillery-load-testing--html-reports)
6. [🔐 How Authentication Bypass Works](#-how-authentication-bypass-works)
7. [⚠️ Performance Tuning & Bottleneck Checklist](#️-performance-tuning--bottleneck-checklist)

---

## ⚡ Quick Start (Run a Test in 1 Minute)

### Step 1: Ensure Server is Running
Open a terminal in `server/` and start your backend:
```bash
npm.cmd run dev
```

### Step 2: Choose How You Want to Run the Test

* **Option A: Web GUI (Visualizer)** ➔ Double-click `load_testing/index.html` to open it in any browser and click **Run Load Test**.
* **Option B: 1,000 Concurrent Sockets (CLI)** ➔ Run:
  ```bash
  cd load_testing
  node run_1000_sockets.js
  ```
* **Option C: 1,000 HTTP Requests (CLI)** ➔ Run:
  ```bash
  cd load_testing
  node run_1000_http.js
  ```
* **Option D: End-to-End (E2E) Message Delivery Benchmark** ➔ Run:
  ```bash
  cd load_testing
  npm run test:e2e
  ```

---

## 🎨 Method 1: Web-Based Latency Visualizer GUI

Simply open [load_testing/index.html](file:///c:/Users/Thivikram%20Thummala/Desktop/Distributed%20chat%20system/load_testing/index.html) in your browser.

### Features:
* **Custom Inputs:** Set Server URL, Target User Count (e.g. 50 to 2,000), Batch Size, Ramp-up Delay, and Test Duration.
* **Live Latency Curves:** Real-time Chart.js graph plotting:
  * ⚡ **Client ➔ Server Latency (Ack):** Time taken for server to acknowledge request.
  * 🔄 **Client ➔ Server ➔ Receiver (E2E):** Time from sender dispatching a message until a separate room receiver gets the broadcast.
* **Summary Report:** Automatically computes p95, p99, and total throughput metrics.

---

## 🛠️ Method 2: Testing ANY REST API Endpoint (Step-by-Step)

Follow these steps whenever you create a new REST API endpoint (e.g. `/api/v1/auth/login`, `/api/v1/rooms`, `/api/v1/media/upload`) and want to test how many requests per second it can handle:

### Step 1: Create or Copy an Artillery YAML File
Create a new YAML file in `load_testing/` (e.g. `test-my-api.yml`):

```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 20
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up traffic to API"
  defaults:
    headers:
      Authorization: "Bearer LOAD_TEST_BYPASS"
      Content-Type: "application/json"

scenarios:
  - name: "Test My Custom Endpoint"
    flow:
      # Change endpoint URL, HTTP method, and JSON body as needed:
      - post:
          url: "/api/v1/rooms"
          json:
            name: "Test Load Room"
            isPrivate: false
```

### Step 2: Run the Test
```bash
cd load_testing
npx artillery run test-my-api.yml
```

---

## 📡 Method 3: Testing ANY WebSocket Event (Step-by-Step)

Follow these steps to test new real-time events (e.g., `typing:update`, `message:send`, `room:leave`):

### Step 1: Create an Artillery WebSocket Scenario File
Create a file (e.g. `test-socket-event.yml`):

```yaml
config:
  target: "http://localhost:3001"
  engines:
    socketio:
      transports: ["websocket"]
  phases:
    - duration: 30
      arrivalRate: 20
      rampTo: 100
      name: "Ramp up to 1,000 Socket Connections"

scenarios:
  - name: "Custom WebSocket Event Scenario"
    engine: socketio
    flow:
      - connect:
          options:
            auth:
              token: "LOAD_TEST_BYPASS"
      # Step 1: Join a room
      - emit:
          channel: "room:join"
          data:
            roomId: "00000000-0000-0000-0000-000000000000"
      - think: 2
      # Step 2: Emit custom event
      - emit:
          channel: "typing:start"
          data:
            roomId: "00000000-0000-0000-0000-000000000000"
      - think: 5
```

### Step 2: Execute the Test
```bash
cd load_testing
npx artillery run test-socket-event.yml
```

---

## 📈 Method 4: Artillery Load Testing & HTML Reports

To generate a visual HTML report of your test results to share with your team:

### 1. Run Test & Save Output to JSON:
```bash
cd load_testing
npx artillery run --output report.json artillery-socketio.yml
```

### 2. Generate HTML Report from JSON:
```bash
npx artillery report report.json
```
*This creates `report.json.html` containing interactive charts for p95/p99 latency, RPS, and errors.*

---

## 🔐 How Authentication Bypass Works

High-concurrency load testing (1,000+ virtual users) can overwhelm your database connection pool if every virtual user performs a DB lookup on connection.

To prevent DB bottlenecks during load testing:
* Pass **`Bearer LOAD_TEST_BYPASS`** in authorization headers or socket auth tokens.
* Both `socketAuth` and HTTP `auth` middlewares recognize this token and instantly grant mock user access (`load_test_user`).
* **Existing JWT validation remains 100% active and secure** for real user tokens.

---

## ⚠️ Performance Tuning & Bottleneck Checklist

If your server fails or drops connections during load tests:

| Bottleneck | Cause | How to Fix |
| :--- | :--- | :--- |
| **Database Pool Exhaustion** | Too many concurrent DB queries | Increase `DB_POOL_MAX` in `.env` (default is `20`). |
| **OS Socket Limit** | Windows / Linux file descriptor limit | Increase `ulimit -n 65535` on Linux or ramp up connections in batches. |
| **High Latency (p99 > 500ms)** | Event loop blocking | Ensure heavy computations are asynchronous. |
| **Connection Drops** | Rapid connection bursts | Increase `STEP_DELAY_MS` to ramp up users gradually. |
