import { Role } from '@prisma/client';
import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { updateRoleSchema, userIdSchema } from '../validators/user.validator.js';

export const userRouter = Router();
userRouter.use(authenticate, requireRole(Role.ADMIN));
userRouter.get('/', asyncHandler(userController.list));
userRouter.get('/:id', validate(userIdSchema), asyncHandler(userController.get));
userRouter.patch('/:id/role', validate(updateRoleSchema), asyncHandler(userController.updateRole));
userRouter.post('/:id/disable', validate(userIdSchema), asyncHandler(userController.disable));
userRouter.post('/:id/enable', validate(userIdSchema), asyncHandler(userController.enable));
