import { z } from 'zod';

export const dashboardMetricsQuerySchema = z.object({
  windowMinutes: z.coerce.number().int().positive().max(1440).default(60)
});
