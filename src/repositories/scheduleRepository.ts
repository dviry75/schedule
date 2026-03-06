import {
  CreatedSource,
  ExecutionType,
  HttpMethod,
  Prisma,
  Schedule,
  ScheduleStatus
} from '@prisma/client';
import { prisma } from '../config/prisma';

export type CreateScheduleInput = {
  organizationId: string;
  createdByUserId: string;
  webhookUrl: string;
  httpMethod: HttpMethod;
  payload: Prisma.InputJsonValue;
  nextRunAt: Date;
  status: ScheduleStatus;
  maxRetries: number;
  createdSource: CreatedSource;
};

export class ScheduleRepository {
  create(data: CreateScheduleInput) {
    return prisma.schedule.create({ data });
  }

  createMany(data: CreateScheduleInput[]) {
    return prisma.schedule.createMany({ data });
  }

  findById(id: string) {
    return prisma.schedule.findUnique({ where: { id } });
  }

  findByIdInOrganization(id: string, organizationId: string) {
    return prisma.schedule.findFirst({
      where: {
        id,
        organizationId
      }
    });
  }

  listByOrganization(organizationId: string, status?: ScheduleStatus) {
    return prisma.schedule.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePendingSchedule(
    id: string,
    data: {
      webhookUrl: string;
      payload: Prisma.InputJsonValue;
      nextRunAt: Date;
      status: ScheduleStatus;
      maxRetries: number;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.schedule.findUnique({ where: { id } });
      if (!current || current.status !== 'pending') {
        return null;
      }

      return tx.schedule.update({
        where: { id },
        data: {
          webhookUrl: data.webhookUrl,
          payload: data.payload,
          nextRunAt: data.nextRunAt,
          status: data.status,
          retryCount: 0,
          maxRetries: data.maxRetries,
          lastError: null,
          lockedAt: null
        }
      });
    });
  }

  async cancelSchedule(id: string): Promise<Schedule | null> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.schedule.findUnique({ where: { id } });
      if (!current) {
        return null;
      }
      if (current.status === 'cancelled') {
        return current;
      }

      return tx.schedule.update({
        where: { id },
        data: {
          status: 'cancelled',
          deletedAt: new Date(),
          lockedAt: null
        }
      });
    });
  }

  async claimPendingSchedules(batchSize: number): Promise<Schedule[]> {
    const records = await prisma.$queryRaw<
      Array<{
        id: string;
        organization_id: string;
        created_by_user_id: string;
        webhook_url: string;
        http_method: HttpMethod;
        payload: Prisma.JsonValue;
        next_run_at: Date;
        status: ScheduleStatus;
        retry_count: number;
        max_retries: number;
        locked_at: Date | null;
        last_error: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        created_source: CreatedSource;
      }>
    >`
      WITH candidate AS (
        SELECT id
        FROM schedules
        WHERE status = 'pending'
          AND next_run_at <= NOW()
        ORDER BY next_run_at ASC
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE schedules s
      SET status = 'running',
          locked_at = NOW(),
          updated_at = NOW()
      FROM candidate c
      WHERE s.id = c.id
      RETURNING s.*;
    `;

    return records.map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      createdByUserId: row.created_by_user_id,
      webhookUrl: row.webhook_url,
      httpMethod: row.http_method,
      payload: row.payload as Prisma.JsonValue,
      nextRunAt: row.next_run_at,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lockedAt: row.locked_at,
      lastError: row.last_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      createdSource: row.created_source
    }));
  }

  async transitionToExpired(scheduleId: string, executedAt: Date) {
    return prisma.$transaction(async (tx) => {
      await tx.schedule.update({
        where: { id: scheduleId },
        data: {
          status: 'expired',
          lockedAt: null,
          lastError: 'Execution expired due to delay threshold'
        }
      });

      await tx.executionLog.create({
        data: {
          scheduleId,
          executedAt,
          statusCode: null,
          durationMs: 0,
          success: false,
          executionType: ExecutionType.skipped_timeout
        }
      });
    });
  }

  async transitionAfterExecution(params: {
    scheduleId: string;
    success: boolean;
    statusCode: number | null;
    durationMs: number;
    executedAt: Date;
    errorMessage?: string;
    retryDelayMinutes: number;
    maxRetries: number;
  }): Promise<{ status: ScheduleStatus; retryCount: number } | undefined> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.schedule.findUnique({ where: { id: params.scheduleId } });
      if (!current) {
        return undefined;
      }

      let finalStatus: ScheduleStatus;
      let finalRetryCount = current.retryCount;

      if (params.success) {
        await tx.schedule.update({
          where: { id: params.scheduleId },
          data: {
            status: 'success',
            lockedAt: null,
            lastError: null
          }
        });
        finalStatus = 'success';
      } else {
        const newRetryCount = current.retryCount + 1;
        finalRetryCount = newRetryCount;
        if (newRetryCount <= params.maxRetries) {
          const nextRunAt = new Date(Date.now() + params.retryDelayMinutes * 60_000);
          await tx.schedule.update({
            where: { id: params.scheduleId },
            data: {
              retryCount: newRetryCount,
              status: 'pending',
              nextRunAt,
              lockedAt: null,
              lastError: params.errorMessage ?? 'Execution failed'
            }
          });
          finalStatus = 'pending';
        } else {
          await tx.schedule.update({
            where: { id: params.scheduleId },
            data: {
              retryCount: newRetryCount,
              status: 'failed',
              lockedAt: null,
              lastError: params.errorMessage ?? 'Execution failed'
            }
          });
          finalStatus = 'failed';
        }
      }

      await tx.executionLog.create({
        data: {
          scheduleId: params.scheduleId,
          executedAt: params.executedAt,
          statusCode: params.statusCode,
          durationMs: params.durationMs,
          success: params.success,
          executionType: ExecutionType.executed
        }
      });

      return {
        status: finalStatus,
        retryCount: finalRetryCount
      };
    });
  }

  async enforceGlobalThroughput(maxPerMinute: number): Promise<boolean> {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM execution_logs
      WHERE executed_at >= date_trunc('minute', NOW())
        AND executed_at < date_trunc('minute', NOW()) + INTERVAL '1 minute';
    `;
    const count = Number(result[0]?.count ?? 0);
    return count < maxPerMinute;
  }

  async releaseStaleRunningSchedules(staleMinutes: number): Promise<Array<{ id: string }>> {
    return prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE schedules
      SET status = 'pending',
          locked_at = NULL,
          last_error = 'Released by reaper after stale running lock',
          updated_at = NOW()
      WHERE status = 'running'
        AND locked_at < NOW() - make_interval(mins => ${staleMinutes})
      RETURNING id;
    `;
  }

  async resetToPendingDueToThrottle(scheduleId: string, delaySeconds: number) {
    return prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'pending',
        lockedAt: null,
        nextRunAt: new Date(Date.now() + delaySeconds * 1000)
      }
    });
  }
}
