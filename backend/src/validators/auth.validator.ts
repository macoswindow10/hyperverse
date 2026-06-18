import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(12).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1).max(128),
  }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(32) }),
});

export const discordCallbackSchema = z.object({
  query: z.object({ code: z.string().min(1) }),
});
