import { ScheduleStatus } from '@prisma/client';
import { z } from 'zod';

const payloadSchema = z.unknown().superRefine((value, ctx) => {
  const bytes = Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');
  if (bytes > 10 * 1024) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Payload exceeds 10KB limit'
    });
  }
});

const isoUtcDate = z.string().datetime({ offset: true }).transform((v) => new Date(v));

export const createScheduleSchema = z.object({
  organizationId: z.string().uuid(),
  webhookUrl: z.string().url(),
  payload: payloadSchema,
  nextRunAt: isoUtcDate,
  createdSource: z.enum(['api', 'ui']).default('api')
});

export const createBatchSchedulesSchema = z.object({
  schedules: z.array(createScheduleSchema).min(1).max(10)
});

export const updateScheduleParamsSchema = z.object({
  id: z.string().uuid()
});

export const updateScheduleSchema = z.object({
  organizationId: z.string().uuid(),
  webhookUrl: z.string().url(),
  payload: payloadSchema,
  nextRunAt: isoUtcDate
});

export const deleteScheduleSchema = z.object({
  organizationId: z.string().uuid()
});

export const resendScheduleSchema = z.object({
  organizationId: z.string().uuid(),
  nextRunAt: isoUtcDate.optional()
});

export const listSchedulesSchema = z.object({
  organizationId: z.string().uuid(),
  status: z.nativeEnum(ScheduleStatus).optional()
});
