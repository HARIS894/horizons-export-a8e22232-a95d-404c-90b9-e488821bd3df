import { randomUUID } from 'node:crypto';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './env.js';

export const logger = pino({
  level: env.logLevel,
  base: {
    service: 'instantcare-backend',
    environment: env.nodeEnv,
  },
});

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
});