import 'dotenv/config';
import { z } from 'zod';

export const env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AGENT_PORT: z.coerce.number().int().positive().default(4100),
  BACKEND_SOCKET_URL: z.string().url(),
  AGENT_TOKEN: z.string().min(16),
}).parse(process.env);
