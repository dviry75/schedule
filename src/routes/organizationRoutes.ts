import { FastifyInstance } from 'fastify';
import { OrganizationController } from '../controllers/organizationController';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const controller = new OrganizationController();

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  app.get('/organizations', { preHandler: [authMiddleware] }, controller.listOrganizations);
  app.post('/organizations', { preHandler: [authMiddleware] }, controller.createOrganization);
  app.get(
    '/organizations/:id/members',
    { preHandler: [authMiddleware, requireRole('ADMIN')] },
    controller.listMembers
  );
}
