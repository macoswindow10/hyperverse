import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return res.status(400).json({ message: 'Validation failed', issues: result.error.flatten() });
  Object.assign(req, result.data);
  return next();
};
