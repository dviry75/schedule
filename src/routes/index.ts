import { FastifyInstance } from 'fastify';
import { authRoutes } from './authRoutes';
import { metricsRoutes } from './metricsRoutes';
import { organizationRoutes } from './organizationRoutes';
import { scheduleRoutes } from './scheduleRoutes';

export async function registerRoutes(app: FastifyInstance, _opts: unknown): Promise<void> {
  await app.register(authRoutes);
  await app.register(organizationRoutes);
  await app.register(scheduleRoutes);
  await app.register(metricsRoutes);
}
