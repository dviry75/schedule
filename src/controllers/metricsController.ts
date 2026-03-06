import { FastifyReply, FastifyRequest } from 'fastify';
import { dashboardMetricsQuerySchema } from '../schemas/metricsSchemas';
import { MetricsService } from '../services/metricsService';

export class MetricsController {
  constructor(private readonly metricsService: MetricsService = new MetricsService()) {}

  dashboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = dashboardMetricsQuerySchema.parse(request.query);
    const metrics = await this.metricsService.getDashboard(query.windowMinutes);
    reply.send(metrics);
  };
}
