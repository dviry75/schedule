import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export class UserRepository {
  create(email: string, passwordHash: string) {
    return prisma.user.create({
      data: { email, passwordHash }
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}

export class OrganizationRepository {
  listForUser(userId: string) {
    return prisma.organization.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  create(name: string) {
    return prisma.organization.create({ data: { name } });
  }

  findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  }
}

export class OrganizationMemberRepository {
  async addMember(organizationId: string, userId: string, role: Role) {
    return prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      },
      update: { role },
      create: { organizationId, userId, role }
    });
  }

  getUserMembership(organizationId: string, userId: string) {
    return prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      }
    });
  }

  listMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
