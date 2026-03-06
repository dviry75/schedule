import { Role } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationMemberRepository } from '../repositories/userRepository';

const membershipRepo = new OrganizationMemberRepository();

const roleRank: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3
};

const resolveOrganizationId = (request: FastifyRequest): string | null => {
  const params = request.params as Record<string, unknown>;
  const query = request.query as Record<string, unknown>;
  const body = request.body as Record<string, unknown> | undefined;

  const fromParams = typeof params?.id === 'string' ? params.id : null;
  const fromBody = typeof body?.organizationId === 'string' ? body.organizationId : null;
  const fromQuery = typeof query?.organizationId === 'string' ? query.organizationId : null;

  return fromBody ?? fromQuery ?? fromParams;
};

export const requireRole = (minimumRole: Role) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user?.sub;
    const organizationId = resolveOrganizationId(request);

    if (!userId || !organizationId) {
      reply.code(400).send({ message: 'organizationId is required' });
      return;
    }

    const membership = await membershipRepo.getUserMembership(organizationId, userId);

    if (!membership || roleRank[membership.role] < roleRank[minimumRole]) {
      reply.code(403).send({ message: 'Forbidden' });
    }
  };
};
