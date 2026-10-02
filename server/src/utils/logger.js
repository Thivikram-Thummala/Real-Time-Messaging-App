import pino from 'pino';
import { config } from '../config/index.js';

/**
 * Structured JSON logger using Pino.
 * - Development: pretty-printed, colorized output via pino-pretty
 * - Production / Grafana Cloud: raw JSON & Grafana Loki log aggregation
 */


// Check if Grafana Loki credentials are present in environment variables
const hasLokiConfig = process.env.GRAFANA_LOKI_URL && process.env.GRAFANA_LOKI_USER && process.env.GRAFANA_TOKEN;

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: hasLokiConfig
    ? {
      target: 'pino-loki',
      options: {
        host: process.env.GRAFANA_LOKI_URL,
        basicAuth: {
          username: process.env.GRAFANA_LOKI_USER,
          password: process.env.GRAFANA_TOKEN
        },
        labels: {
          app: 'real-time-chat-server',
          env: config.NODE_ENV || 'development'
        },
        batching: false // Disable batching for instant log delivery
      }
    }
    :
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
