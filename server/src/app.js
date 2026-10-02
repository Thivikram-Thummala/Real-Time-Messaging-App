import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { register, metricsMiddleware } from './utils/metrics.js';

// 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const metricsDashboardPath = path.resolve(__dirname, '../../metrics_dashboard');

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

// Metrics collection middleware
app.use(metricsMiddleware);

// Serve local metrics visualizer dashboard UI
app.use('/metrics/ui', express.static(metricsDashboardPath));
app.get('/metrics/ui', (req, res) => {
  res.sendFile(path.join(metricsDashboardPath, 'index.html'));
});

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId || 'anonymous';
    const userMsg = userId !== 'anonymous' ? `by User [${userId}]` : 'by Anonymous User';
    
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId,
        ip: req.ip
      },
      `[${req.method} ${req.originalUrl}] completed in ${duration}ms (Status ${res.statusCode}) ${userMsg}`
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

// Prometheus metrics exposition endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
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
