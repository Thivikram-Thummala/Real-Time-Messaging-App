import pino from 'pino';
import { config } from '../config/index.js';

/**
 * Structured JSON logger using Pino.
 * - Development: pretty-printed, colorized output via pino-pretty
 * - Production: raw JSON for log aggregation tools
 */
export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    config.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined
});
