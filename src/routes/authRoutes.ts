import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/authController';

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', controller.register);
  app.post('/auth/login', controller.login);
}
