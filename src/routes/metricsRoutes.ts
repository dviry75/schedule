import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { MetricsController } from '../controllers/metricsController';

const controller = new MetricsController();

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/metrics/dashboard', { preHandler: [authMiddleware] }, controller.dashboard);
}
