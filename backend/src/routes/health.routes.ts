import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const healthRouter = Router();
healthRouter.get('/health', asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', service: 'hyperverse-backend', timestamp: new Date().toISOString() });
}));
