import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const start = async () => {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info({ port: env.PORT }, 'server_started');
  } catch (error) {
    logger.error({ error }, 'server_start_failed');
    process.exit(1);
  }
};

void start();
