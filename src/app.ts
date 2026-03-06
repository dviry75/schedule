import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';
import { env } from './config/env';
import { logger } from './config/logger';
import { registerRoutes } from './routes';
import { AppError } from './utils/errors';

export const buildApp = () => {
  const app = Fastify({
    logger,
    requestIdHeader: 'x-request-id'
  });

  app.register(cors, { origin: true });
  app.register(sensible);
  app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: 'Validation failed', issues: error.issues });
      return;
    }

    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
      return;
    }

    reply.code(500).send({ message: 'Internal Server Error' });
  });

  app.register(registerRoutes);

  return app;
};
