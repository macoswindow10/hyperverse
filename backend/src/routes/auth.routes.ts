import { ActivityAction } from '@prisma/client';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logActivity } from '../middleware/activityLogger.js';
import { validate } from '../middleware/validate.js';
import { discordCallbackSchema, loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator.js';

export const authRouter = Router();
authRouter.post('/register', validate(registerSchema), asyncHandler(authController.register));
authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));
authRouter.get('/discord', authController.discordStart);
authRouter.get('/discord/callback', validate(discordCallbackSchema), asyncHandler(authController.discordCallback));
authRouter.get('/me', authenticate, logActivity(ActivityAction.PROFILE_VIEWED), authController.me);
