import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationService } from '../services/organizationService';
import {
  createOrganizationSchema,
  organizationIdParamsSchema
} from '../schemas/organizationSchemas';

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService = new OrganizationService()) {}

  listOrganizations = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user.sub;
    const organizations = await this.organizationService.listOrganizations(userId);
    reply.send(organizations);
  };

  createOrganization = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createOrganizationSchema.parse(request.body);
    const organization = await this.organizationService.createOrganization(request.user.sub, body.name);
    reply.code(201).send(organization);
  };

  listMembers = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = organizationIdParamsSchema.parse(request.params);
    const members = await this.organizationService.listMembers(request.user.sub, params.id);
    reply.send(members);
  };
}
