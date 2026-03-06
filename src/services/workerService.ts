import { Schedule } from '@prisma/client';
import pLimit from 'p-limit';
import { fetch } from 'undici';
import { env } from '../config/env';
import { httpAgent } from '../config/http';
import { logger } from '../config/logger';
import { ScheduleRepository } from '../repositories/scheduleRepository';
import { SlidingWindowRateLimiter } from '../utils/rateLimiter';
import { isPastByMinutes, nowUtc } from '../utils/time';

export class WorkerService {
  private readonly scheduleRepository: ScheduleRepository;
  private readonly requestLimiter: ReturnType<typeof pLimit>;
  private readonly throughputLimiter: SlidingWindowRateLimiter;

  constructor() {
    this.scheduleRepository = new ScheduleRepository();
    this.requestLimiter = pLimit(env.WORKER_MAX_CONCURRENCY);
    this.throughputLimiter = new SlidingWindowRateLimiter(env.WORKER_MAX_PER_MINUTE, 60_000);
  }

  async runCycle(cycleId: string): Promise<void> {
    const claimed = await this.scheduleRepository.claimPendingSchedules(env.WORKER_BATCH_SIZE);

    if (claimed.length === 0) {
      return;
    }

    claimed.forEach((schedule) => {
      logger.info(
        {
          worker_cycle_id: cycleId,
          schedule_id: schedule.id,
          event: 'schedule_claimed'
        },
        'schedule_claimed'
      );
    });

    await Promise.all(
      claimed.map((schedule) =>
        this.requestLimiter(() => this.processSchedule(schedule, cycleId))
      )
    );
  }

  private async processSchedule(schedule: Schedule, cycleId: string): Promise<void> {
    const now = nowUtc();

    if (isPastByMinutes(schedule.nextRunAt, env.SCHEDULE_EXPIRY_MINUTES, now)) {
      await this.scheduleRepository.transitionToExpired(schedule.id, now);
      logger.info(
        {
          worker_cycle_id: cycleId,
          schedule_id: schedule.id,
          event: 'schedule_expired'
        },
        'schedule_expired'
      );
      return;
    }

    const canExecute = await this.scheduleRepository.enforceGlobalThroughput(env.WORKER_MAX_PER_MINUTE);
    if (!canExecute) {
      await this.scheduleRepository.resetToPendingDueToThrottle(schedule.id, 5);
      return;
    }

    await this.throughputLimiter.waitForSlot();

    const startedAt = Date.now();
    let statusCode: number | null = null;
    let success = false;
    let errorMessage: string | undefined;

    try {
      const response = await fetch(schedule.webhookUrl, {
        method: 'POST',
        body: JSON.stringify(schedule.payload),
        headers: {
          'content-type': 'application/json'
        },
        redirect: 'follow',
        dispatcher: httpAgent,
        signal: AbortSignal.timeout(env.REQUEST_TIMEOUT_MS)
      });

      statusCode = response.status;
      success = response.status >= 200 && response.status <= 299;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
    }

    const durationMs = Date.now() - startedAt;
    const result = await this.scheduleRepository.transitionAfterExecution({
      scheduleId: schedule.id,
      success,
      statusCode,
      durationMs,
      executedAt: nowUtc(),
      errorMessage,
      retryDelayMinutes: env.RETRY_DELAY_MINUTES,
      maxRetries: env.SCHEDULE_MAX_RETRIES
    });

    logger.info(
      {
        worker_cycle_id: cycleId,
        schedule_id: schedule.id,
        status_code: statusCode,
        duration_ms: durationMs,
        success,
        event: 'schedule_executed'
      },
      'schedule_executed'
    );

    if (!result) {
      return;
    }

    if (result.status === 'pending') {
      logger.warn(
        {
          worker_cycle_id: cycleId,
          schedule_id: schedule.id,
          retry_count: result.retryCount,
          event: 'schedule_retry_scheduled'
        },
        'schedule_retry_scheduled'
      );
    }

    if (result.status === 'failed') {
      logger.error(
        {
          worker_cycle_id: cycleId,
          schedule_id: schedule.id,
          retry_count: result.retryCount,
          event: 'schedule_failed'
        },
        'schedule_failed'
      );
    }
  }
}
