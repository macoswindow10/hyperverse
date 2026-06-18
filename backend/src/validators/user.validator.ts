import { Role } from '@prisma/client';
import { z } from 'zod';

export const updateRoleSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({ role: z.nativeEnum(Role) }),
});

export const userIdSchema = z.object({ params: z.object({ id: z.string().cuid() }) });
