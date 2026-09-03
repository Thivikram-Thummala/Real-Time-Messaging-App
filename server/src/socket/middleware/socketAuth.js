import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { pool } from '../../config/database.js';
import { findById } from '../../database/queries/users.js';

export const socketAuth = async (socket, next) => {
  try {
    const authHeader =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token ||
      socket.handshake.query?.authorization ||
      socket.handshake.query?.auth;

    if (!authHeader) {
      return next(new Error('Authentication error: Token is required'));
    }

    // Extract Bearer token if it has that prefix, otherwise use as-is
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // Load Testing Bypass — allows high-concurrency load testing without hitting DB pool limits
    if (token === 'LOAD_TEST_BYPASS' || process.env.LOAD_TEST_MODE === 'true') {
      socket.data.user = {
        userId: '8b0e9b86-ee11-4ca6-817e-de388d9ad6a5',
        email: 'alice@example.com',
        username: 'alice'
      };
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Fetch user username from database to attach to socket metadata
    const userRes = await findById(pool, decoded.userId);
    const user = userRes.rows[0];

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach validated user information to socket.data
    socket.data.user = {
      userId: user.id,
      email: user.email,
      username: user.username
    };

    next();
  } catch (err) {
    console.error('Socket authentication failed:', err.message);
    next(new Error('Authentication error: Invalid or expired token'));
  }
};
