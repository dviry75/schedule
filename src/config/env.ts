import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('1d'),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  WORKER_BATCH_SIZE: z.coerce.number().int().positive().max(200).default(200),
  WORKER_MAX_CONCURRENCY: z.coerce.number().int().positive().max(100).default(100),
  WORKER_MAX_PER_MINUTE: z.coerce.number().int().positive().max(1000).default(1000),
  SCHEDULE_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  SCHEDULE_MAX_RETRIES: z.coerce.number().int().positive().default(3),
  RETRY_DELAY_MINUTES: z.coerce.number().int().positive().default(1),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
  REAPER_INTERVAL_MS: z.coerce.number().int().positive().default(60000),
  REAPER_STALE_LOCK_MINUTES: z.coerce.number().int().positive().default(2)
});

export const env = envSchema.parse(process.env);
