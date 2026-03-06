import { FastifyReply, FastifyRequest } from 'fastify';
import { ScheduleService } from '../services/scheduleService';
import {
  createBatchSchedulesSchema,
  createScheduleSchema,
  deleteScheduleSchema,
  listSchedulesSchema,
  resendScheduleSchema,
  updateScheduleParamsSchema,
  updateScheduleSchema
} from '../schemas/scheduleSchemas';

export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService = new ScheduleService()) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createScheduleSchema.parse(request.body);
    const schedule = await this.scheduleService.createSchedule({
      organizationId: body.organizationId,
      createdByUserId: request.user.sub,
      webhookUrl: body.webhookUrl,
      payload: body.payload,
      nextRunAt: body.nextRunAt,
      createdSource: body.createdSource
    });

    request.log.info(
      {
        request_id: request.id,
        schedule_id: schedule.id,
        event: 'schedule_created'
      },
      'schedule_created'
    );

    reply.code(201).send(schedule);
  };

  createBatch = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createBatchSchedulesSchema.parse(request.body);
    const result = await this.scheduleService.createBatch({
      createdByUserId: request.user.sub,
      schedules: body.schedules.map((item) => ({
        organizationId: item.organizationId,
        webhookUrl: item.webhookUrl,
        payload: item.payload,
        nextRunAt: item.nextRunAt,
        createdSource: item.createdSource
      }))
    });

    request.log.info(
      {
        request_id: request.id,
        created: result.created,
        event: 'schedule_created'
      },
      'schedule_created'
    );

    reply.code(201).send(result);
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = updateScheduleParamsSchema.parse(request.params);
    const body = updateScheduleSchema.parse(request.body);

    const updated = await this.scheduleService.editSchedule({
      userId: request.user.sub,
      id: params.id,
      organizationId: body.organizationId,
      webhookUrl: body.webhookUrl,
      payload: body.payload,
      nextRunAt: body.nextRunAt
    });

    reply.send(updated);
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = updateScheduleParamsSchema.parse(request.params);
    const body = deleteScheduleSchema.parse(request.body);

    const cancelled = await this.scheduleService.cancelSchedule(params.id, body.organizationId, request.user.sub);
    reply.send(cancelled);
  };

  resend = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = updateScheduleParamsSchema.parse(request.params);
    const body = resendScheduleSchema.parse(request.body);

    const schedule = await this.scheduleService.resendSchedule({
      scheduleId: params.id,
      organizationId: body.organizationId,
      createdByUserId: request.user.sub,
      nextRunAt: body.nextRunAt
    });

    request.log.info(
      {
        request_id: request.id,
        schedule_id: schedule.id,
        event: 'schedule_created'
      },
      'schedule_created'
    );

    reply.code(201).send(schedule);
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listSchedulesSchema.parse(request.query);
    const schedules = await this.scheduleService.listSchedules(request.user.sub, query.organizationId, query.status);
    reply.send(schedules);
  };
}
