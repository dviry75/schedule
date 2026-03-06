import { Agent } from 'undici';

export const httpAgent = new Agent({
  connect: { timeout: 3000 },
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 30_000
});
