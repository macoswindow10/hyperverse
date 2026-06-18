import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { created } from '../utils/http.js';

const contextFrom = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });

export class AuthController {
  register = async (req: Request, res: Response) => created(res, await authService.register(req.body, contextFrom(req)));
  login = async (req: Request, res: Response) => res.json(await authService.login(req.body, contextFrom(req)));
  refresh = async (req: Request, res: Response) => res.json(await authService.refresh(req.body.refreshToken, contextFrom(req)));
  logout = async (req: Request, res: Response) => res.json(await authService.logout(req.body.refreshToken));
  discordStart = (_req: Request, res: Response) => res.redirect(authService.getDiscordAuthorizeUrl());
  discordCallback = async (req: Request, res: Response) => res.json(await authService.loginWithDiscord(String(req.query.code), contextFrom(req)));
  me = (req: Request, res: Response) => res.json({ user: req.user });
}
export const authController = new AuthController();
