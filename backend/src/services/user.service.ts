import { ActivityAction, type Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const publicUserSelect = { id: true, email: true, username: true, role: true, isActive: true, createdAt: true, updatedAt: true } as const;

export class UserService {
  listUsers() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: publicUserSelect });
  }

  getUser(id: string) {
    return prisma.user.findUniqueOrThrow({ where: { id }, select: publicUserSelect });
  }

  async updateRole(id: string, role: Role, actorId: string) {
    const user = await prisma.user.update({ where: { id }, data: { role }, select: publicUserSelect });
    await prisma.activityLog.create({ data: { userId: actorId, action: ActivityAction.USER_ROLE_UPDATED, metadata: { targetUserId: id, role } } });
    return user;
  }

  async setActive(id: string, isActive: boolean, actorId: string) {
    const user = await prisma.user.update({ where: { id }, data: { isActive }, select: publicUserSelect });
    await prisma.activityLog.create({ data: { userId: actorId, action: isActive ? ActivityAction.USER_ENABLED : ActivityAction.USER_DISABLED, metadata: { targetUserId: id } } });
    return user;
  }
}
export const userService = new UserService();
