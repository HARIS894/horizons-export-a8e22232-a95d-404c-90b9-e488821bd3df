import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, `InstantCare backend listening on port ${env.port}`);
});

process.on('unhandledRejection', (error) => {
  logger.error({ err: error }, 'Unhandled promise rejection');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});