import { createServer } from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { initSocketServer } from './socket/index.js';

const server = createServer(app);

// Initialize Socket.io server
initSocketServer(server);

const PORT = config.PORT;

server.listen(PORT, () => {
  logger.info(
    { port: PORT, serverId: config.SERVER_ID, env: config.NODE_ENV },
    'Monolith HTTP server booted successfully'
  );
});
