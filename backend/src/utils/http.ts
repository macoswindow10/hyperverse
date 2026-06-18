import type { Response } from 'express';

export function created<T>(res: Response, data: T): Response<T> {
  return res.status(201).json(data);
}
