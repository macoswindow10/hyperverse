import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.js';

const hierarchy: Record<Role, number> = { USER: 1, SUPPORT: 2, ADMIN: 3, OWNER: 4 };

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: 'Missing bearer token' });
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const requireRole = (role: Role) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (hierarchy[req.user.role] < hierarchy[role]) return res.status(403).json({ message: 'Insufficient permissions' });
  return next();
};
