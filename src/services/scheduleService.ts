import { CreatedSource, HttpMethod, Role, ScheduleStatus } from '@prisma/client';
import { env } from '../config/env';
import { ScheduleRepository } from '../repositories/scheduleRepository';
import { OrganizationMemberRepository } from '../repositories/userRepository';
import { AppError } from '../utils/errors';
import { addMinutesUtc, nowUtc } from '../utils/time';

type ScheduleInput = {
  organizationId: string;
  createdByUserId: string;
  webhookUrl: string;
  payload: unknown;
  nextRunAt: Date;
  createdSource: 'api' | 'ui' | 'manual_resend';
};

export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository = new ScheduleRepository(),
    private readonly memberRepository: OrganizationMemberRepository = new OrganizationMemberRepository()
  ) {}

  private readonly roleRank: Record<Role, number> = {
    MEMBER: 1,
    ADMIN: 2,
    OWNER: 3
  };

  private async assertOrganizationRole(userId: string, organizationId: string, minimumRole: Role): Promise<void> {
    const membership = await this.memberRepository.getUserMembership(organizationId, userId);
    if (!membership || this.roleRank[membership.role] < this.roleRank[minimumRole]) {
      throw new AppError(403, 'Forbidden');
    }
  }

  private buildCreateStatus(nextRunAt: Date, now: Date): ScheduleStatus {
    return nextRunAt.getTime() < now.getTime() ? 'expired' : 'pending';
  }

  async createSchedule(input: ScheduleInput) {
    await this.assertOrganizationRole(input.createdByUserId, input.organizationId, 'MEMBER');

    const now = nowUtc();
    const status = this.buildCreateStatus(input.nextRunAt, now);

    return this.scheduleRepository.create({
      organizationId: input.organizationId,
      createdByUserId: input.createdByUserId,
      webhookUrl: input.webhookUrl,
      httpMethod: HttpMethod.POST,
      payload: input.payload as never,
      nextRunAt: input.nextRunAt,
      status,
      maxRetries: env.SCHEDULE_MAX_RETRIES,
      createdSource: input.createdSource as CreatedSource
    });
  }

  async createBatch(input: {
    createdByUserId: string;
    schedules: Array<Omit<ScheduleInput, 'createdByUserId'>>;
  }) {
    await Promise.all(
      input.schedules.map((item) =>
        this.assertOrganizationRole(input.createdByUserId, item.organizationId, 'MEMBER')
      )
    );

    const now = nowUtc();
    const data = input.schedules.map((item) => ({
      organizationId: item.organizationId,
      createdByUserId: input.createdByUserId,
      webhookUrl: item.webhookUrl,
      httpMethod: HttpMethod.POST,
      payload: item.payload as never,
      nextRunAt: item.nextRunAt,
      status: this.buildCreateStatus(item.nextRunAt, now),
      maxRetries: env.SCHEDULE_MAX_RETRIES,
      createdSource: item.createdSource as CreatedSource
    }));

    await this.scheduleRepository.createMany(data);
    return { created: data.length };
  }

  async editSchedule(params: {
    userId: string;
    id: string;
    organizationId: string;
    webhookUrl: string;
    payload: unknown;
    nextRunAt: Date;
  }) {
    await this.assertOrganizationRole(params.userId, params.organizationId, 'MEMBER');

    const schedule = await this.scheduleRepository.findByIdInOrganization(params.id, params.organizationId);
    if (!schedule) {
      throw new AppError(404, 'Schedule not found');
    }

    const status = this.buildCreateStatus(params.nextRunAt, nowUtc());

    const updated = await this.scheduleRepository.updatePendingSchedule(params.id, {
      webhookUrl: params.webhookUrl,
      payload: params.payload as never,
      nextRunAt: params.nextRunAt,
      status,
      maxRetries: env.SCHEDULE_MAX_RETRIES
    });

    if (!updated) {
      throw new AppError(409, 'Schedule can only be edited when status is pending');
    }

    return updated;
  }

  async cancelSchedule(id: string, organizationId: string, userId: string) {
    await this.assertOrganizationRole(userId, organizationId, 'ADMIN');

    const schedule = await this.scheduleRepository.findByIdInOrganization(id, organizationId);
    if (!schedule) {
      throw new AppError(404, 'Schedule not found');
    }

    return this.scheduleRepository.cancelSchedule(id);
  }

  async resendSchedule(params: {
    scheduleId: string;
    organizationId: string;
    createdByUserId: string;
    nextRunAt?: Date;
  }) {
    await this.assertOrganizationRole(params.createdByUserId, params.organizationId, 'MEMBER');

    const source = await this.scheduleRepository.findByIdInOrganization(params.scheduleId, params.organizationId);
    if (!source) {
      throw new AppError(404, 'Schedule not found');
    }

    const targetNextRunAt = params.nextRunAt ?? addMinutesUtc(nowUtc(), 0);

    return this.createSchedule({
      organizationId: source.organizationId,
      createdByUserId: params.createdByUserId,
      webhookUrl: source.webhookUrl,
      payload: source.payload,
      nextRunAt: targetNextRunAt,
      createdSource: 'manual_resend'
    });
  }

  async listSchedules(userId: string, organizationId: string, status?: ScheduleStatus) {
    await this.assertOrganizationRole(userId, organizationId, 'MEMBER');
    return this.scheduleRepository.listByOrganization(organizationId, status);
  }
}
