import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120)
});

export const organizationIdParamsSchema = z.object({
  id: z.string().uuid()
});
