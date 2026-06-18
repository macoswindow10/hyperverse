import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';

export class UserController {
  list = async (_req: Request, res: Response) => res.json({ users: await userService.listUsers() });
  get = async (req: Request, res: Response) => res.json({ user: await userService.getUser(req.params.id!) });
  updateRole = async (req: Request, res: Response) => res.json({ user: await userService.updateRole(req.params.id!, req.body.role, req.user?.id ?? '') });
  disable = async (req: Request, res: Response) => res.json({ user: await userService.setActive(req.params.id!, false, req.user?.id ?? '') });
  enable = async (req: Request, res: Response) => res.json({ user: await userService.setActive(req.params.id!, true, req.user?.id ?? '') });
}
export const userController = new UserController();
