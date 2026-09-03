import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Import Feature Routers
import authRoutes from './modules/auth/auth.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
};

// Apply security and parser middlewares
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip
      },
      'HTTP request completed'
    );
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    serverId: config.SERVER_ID
  });
});

// Mount Feature Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/rooms/:roomId/messages', messagesRoutes);
app.use('/api/v1/media', mediaRoutes);

// Register Global Error Handler (must be last)
app.use(errorHandler);

export default app;
