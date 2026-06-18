import type { ActivityAction } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const logActivity = (action: ActivityAction) => (req: Request, _res: Response, next: NextFunction) => {
  void prisma.activityLog.create({ data: { action, userId: req.user?.id, ipAddress: req.ip, userAgent: req.get('user-agent'), metadata: { path: req.path, method: req.method } } }).catch(console.error);
  next();
};
