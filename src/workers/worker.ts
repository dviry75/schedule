import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ReaperService } from '../services/reaperService';
import { WorkerService } from '../services/workerService';

const workerService = new WorkerService();
const reaperService = new ReaperService();

const runWorkerLoop = async () => {
  while (true) {
    const cycleId = randomUUID();
    try {
      await workerService.runCycle(cycleId);
    } catch (error) {
      logger.error({ error, worker_cycle_id: cycleId }, 'worker_cycle_failed');
    }

    await new Promise((resolve) => setTimeout(resolve, env.WORKER_POLL_INTERVAL_MS));
  }
};

const runReaperLoop = async () => {
  while (true) {
    try {
      await reaperService.run(env.REAPER_STALE_LOCK_MINUTES);
    } catch (error) {
      logger.error({ error }, 'reaper_cycle_failed');
    }

    await new Promise((resolve) => setTimeout(resolve, env.REAPER_INTERVAL_MS));
  }
};

const start = async () => {
  logger.info('worker_started');
  await Promise.all([runWorkerLoop(), runReaperLoop()]);
};

void start();
