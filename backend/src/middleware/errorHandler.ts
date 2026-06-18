import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res, next).catch(next); };

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) return res.status(400).json({ message: 'Validation failed', issues: error.flatten() });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Resource already exists' });
    if (error.code === 'P2025') return res.status(404).json({ message: 'Resource not found' });
  }
  const status = error.message.includes('Invalid credentials') || error.message.includes('Invalid refresh token') ? 401 : 500;
  res.status(status).json({ message: status === 500 ? 'Internal server error' : error.message });
}
