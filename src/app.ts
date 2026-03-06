import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { ZodError } from 'zod';
import { env } from './config/env';
import { registerRoutes } from './routes';
import { AppError } from './utils/errors';

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL
    },
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

  app.register(registerRoutes, { prefix: '/api' });

  const frontendDistPath = path.resolve(process.cwd(), 'frontend', 'dist');
  if (env.NODE_ENV === 'production' && existsSync(frontendDistPath)) {
    app.register(fastifyStatic, {
      root: frontendDistPath,
      prefix: '/'
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.method === 'GET' && !request.url.startsWith('/api')) {
        return reply.sendFile('index.html');
      }
      return reply.code(404).send({ message: 'Not Found' });
    });
  }

  return app;
};
