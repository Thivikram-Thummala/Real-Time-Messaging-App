# ⚡ Distributed Real-Time Chat System

A high-performance, scalable distributed real-time chat application built with **React**, **Node.js (Express & Socket.io)**, and **PostgreSQL**. Featuring dark mode glassmorphism UI, dual-channel REST & WebSocket event flows, multi-room channels, typing indicators, user search, and high-concurrency load testing suites.

---

## 📋 Table of Features (REST vs. WebSockets)

The system utilizes a **Dual-Channel Architecture**:
* **HTTP REST APIs:** For stateless, transactional operations (Auth, DB persistence, History pagination, User Search).
* **WebSockets (Socket.io):** For real-time, bi-directional event delivery (Instant messaging, Typing indicators, Live presence).

### 🌐 Standard HTTP REST API Features

| Feature | HTTP Endpoint / Method | Description | Protocol / Standard |
| :--- | :--- | :--- | :--- |
| **User Registration** | `POST /api/v1/auth/register` | Creates new user account, hashes password via `bcrypt`, returns JWT. | HTTP REST |
| **User Login** | `POST /api/v1/auth/login` | Authenticates email & password, returns JWT token. | HTTP REST |
| **Session Auto-Restore** | `GET /api/v1/auth/me` | Restores user profile using JWT token stored in `localStorage`. | HTTP REST |
| **List Joined Rooms** | `GET /api/v1/rooms` | Fetches all room channels that the user is a member of. | HTTP REST |
| **Create New Room** | `POST /api/v1/rooms` | Creates a new Public/Private room channel and assigns admin role. | HTTP REST |
| **Get Room Details & Members** | `GET /api/v1/rooms/:roomId` | Fetches room metadata and list of joined members with roles. | HTTP REST |
| **Update Profile** | `PUT /api/v1/auth/me` | Updates the authenticated user's profile information (e.g., username). | HTTP REST |
| **Add Target User to Room** | `POST /api/v1/rooms/:roomId/members` | Adds another user to a room channel by `userId`. | HTTP REST |
| **Leave Room** | `POST /api/v1/rooms/:roomId/leave` | Removes the authenticated user from a room channel. | HTTP REST |
| **User Search** | `GET /api/v1/users/search?q=query` | Case-insensitive search across users by username or email. | HTTP REST |
| **Load Message History** | `GET /api/v1/rooms/:roomId/messages` | Fetches historic chat messages with cursor-based pagination. | HTTP REST |
| **Send Message** | `POST /api/v1/rooms/:roomId/messages` | Persists text/image content into PostgreSQL database. | HTTP REST |

---

### ⚡ Real-Time WebSocket Features (Socket.io)

| Feature | Event Name | Flow Direction | Description | Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Authenticated Handshake** | `connect` | Client ➔ Server | Establishes binary WebSocket pipe using `auth.token` JWT verification. | WebSockets |
| **Room Channel Join** | `room:join` | Client ➔ Server | Subscribes client socket to internal Socket.io room channel. | WebSockets |
| **Room Channel Leave** | `room:leave` | Client ➔ Server | Unsubscribes client socket from room channel routing. | WebSockets |
| **Instant Message Broadcast** | `message:new` | Server ➔ Room Clients | Pushes new enriched message payload to room members in **< 5ms**. | WebSockets |
| **Typing Started** | `typing:start` | Client ➔ Server | Emitted when user types in the message input box. | WebSockets |
| **Typing Stopped** | `typing:stop` | Client ➔ Server | Emitted on Enter or after 1.5 seconds of keyboard inactivity. | WebSockets |
| **Typing Indicator Update** | `typing:update` | Server ➔ Room Clients | Broadcasts `isTyping: true/false` to render "*Alice is typing...*" banner. | WebSockets |
| **User Online Presence** | `user:online` | Server ➔ Broadcast | Pushes real-time online status updates when users connect or disconnect. | WebSockets |

---

## 🛠️ Tech Stack & Tools

* **Frontend:** React 18, Vite, Lucide Icons, HSL Glassmorphism CSS.
* **Backend:** Node.js, Express, Socket.io, TypeScript, dotenvx.
* **Database:** PostgreSQL (with `pg` connection pool & migration runner).
* **Load Testing & Analytics:** Web GUI Visualizer (`Chart.js`), Artillery, Custom Node.js Socket Simulators.

---

## 📂 Project Architecture

```text
Distributed chat system/
├── client/                     # ⚛️ React Frontend Application (Vite)
│   ├── src/
│   │   ├── components/         # Sidebar, ChatWindow, ChatFeed, Modals, MembersList
│   │   └── services/           # Clean Modular Service Layer (auth, rooms, messages, users, socket)
│   └── index.html
├── server/                     # 🚀 Express & Socket.io Backend Server
│   ├── src/
│   │   ├── database/           # PostgreSQL connection pool, migrations & SQL queries
│   │   ├── modules/            # Auth, Rooms, Messages, Users, Media controllers & routes
│   │   └── socket/             # Socket.io server initialization & handlers
├── load_testing/               # ⚡ Load Testing Suite & GUI Visualizer
│   ├── index.html              # 🎨 Web-Based Latency Visualizer GUI (Chart.js)
│   ├── run_e2e_msg_test.js     # 💬 E2E Message Delivery Benchmark (100% success rate test)
│   ├── run_1000_sockets.js     # ⚡ 1,000 Concurrent Socket Simulator
│   └── artillery-socketio.yml  # 🛠️ Artillery WebSocket load test scenario
└── Architecture design/        # 📊 System Flow Diagrams (Mermaid & Draw.io formats)
```

---

## 🚀 Getting Started

### 1. Database & Environment Setup
Ensure PostgreSQL is running locally on port `5432` with connection string set in `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
PORT=3001
JWT_SECRET=super_secret_jwt_key
```

Run PostgreSQL migrations:
```bash
cd server
npm run migrate
```

### 2. Start Backend Server
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:3001`*

### 3. Start React Frontend
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 4. Run Load Tests & Benchmarks
```bash
cd load_testing

# Run 1,000 Socket Connections Test
npm run test:1000

# Run End-to-End Message Benchmark (REST DB persistence ➔ WS Broadcast)
npm run test:e2e
```
*Or open `load_testing/index.html` in your browser for real-time visual latency curves!*
