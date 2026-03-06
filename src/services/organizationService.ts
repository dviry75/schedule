import { Role } from '@prisma/client';
import { AppError } from '../utils/errors';
import {
  OrganizationMemberRepository,
  OrganizationRepository
} from '../repositories/userRepository';

export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
    private readonly memberRepository: OrganizationMemberRepository = new OrganizationMemberRepository()
  ) {}

  listOrganizations(userId: string) {
    return this.organizationRepository.listForUser(userId);
  }

  async createOrganization(userId: string, name: string) {
    const organization = await this.organizationRepository.create(name);
    await this.memberRepository.addMember(organization.id, userId, Role.OWNER);
    return organization;
  }

  async listMembers(requestingUserId: string, organizationId: string) {
    const membership = await this.memberRepository.getUserMembership(organizationId, requestingUserId);
    if (!membership) {
      throw new AppError(403, 'Forbidden');
    }

    return this.memberRepository.listMembers(organizationId);
  }
}
