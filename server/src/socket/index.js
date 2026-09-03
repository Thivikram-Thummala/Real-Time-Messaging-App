import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { socketAuth } from './middleware/socketAuth.js';
import { handleConnection } from './handlers/connection.js';
import { handleRoomEvents } from './handlers/room.js';
import { handleTypingEvents } from './handlers/typing.js';

let io;

const getCorsOrigin = () => {
  if (!config.CORS_ORIGIN || config.CORS_ORIGIN === '*') {
    return true;
  }
  const origins = config.CORS_ORIGIN.split(',').map(o => o.trim());
  return origins.length === 1 ? origins[0] : origins;
};

// initialize the socket server instance using http server(we created in app.ts)
export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: getCorsOrigin(),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Apply JWT authentication handshake middleware
  io.use(socketAuth);

  //listening for connection event emitted by a new client
  io.on('connection', (socket) => {
    // 1. Connection / Disconnect status presence handler
    handleConnection(io, socket);

    // 2. Room membership handler
    handleRoomEvents(io, socket);

    // 3. Typing event handler
    handleTypingEvents(io, socket);
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io instance has not been initialized');
  }
  return io;
};
