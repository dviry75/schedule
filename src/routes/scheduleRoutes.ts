import { FastifyInstance } from 'fastify';
import { ScheduleController } from '../controllers/scheduleController';
import { authMiddleware } from '../middleware/auth';

const controller = new ScheduleController();

export async function scheduleRoutes(app: FastifyInstance): Promise<void> {
  app.post('/schedules', { preHandler: [authMiddleware] }, controller.create);
  app.post('/schedules/batch', { preHandler: [authMiddleware] }, controller.createBatch);
  app.put('/schedules/:id', { preHandler: [authMiddleware] }, controller.update);
  app.delete('/schedules/:id', { preHandler: [authMiddleware] }, controller.delete);
  app.post('/schedules/:id/resend', { preHandler: [authMiddleware] }, controller.resend);
  app.get('/schedules', { preHandler: [authMiddleware] }, controller.list);
}
