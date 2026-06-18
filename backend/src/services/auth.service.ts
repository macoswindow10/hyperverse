import { ActivityAction, type Role, type User } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { createOpaqueToken, parseDurationToMs, sha256 } from '../utils/tokens.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';

interface RegisterInput { email: string; username: string; password: string; }
interface LoginInput { email: string; password: string; }
interface DiscordUser { id: string; username: string; email: string; avatar: string | null; }
interface RequestContext { ipAddress?: string; userAgent?: string; }

export class AuthService {
  async register(input: RegisterInput, context: RequestContext) {
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({ data: { email: input.email, username: input.username, passwordHash } });
    await this.recordActivity(user.id, ActivityAction.USER_REGISTERED, context);
    return this.issueTokens(user);
  }

  async login(input: LoginInput, context: RequestContext) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('Account disabled');
    await this.recordActivity(user.id, ActivityAction.USER_LOGGED_IN, context);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string, context: RequestContext) {
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(refreshToken) }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive) throw new Error('Invalid refresh token');
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    await this.recordActivity(stored.user.id, ActivityAction.TOKEN_REFRESHED, context);
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: sha256(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }

  getDiscordAuthorizeUrl() {
    const url = new URL('https://discord.com/oauth2/authorize');
    url.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
    url.searchParams.set('redirect_uri', env.DISCORD_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify email');
    return url.toString();
  }

  async loginWithDiscord(code: string, context: RequestContext) {
    const discordUser = await this.fetchDiscordUser(code);
    const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null;
    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      create: { discordId: discordUser.id, email: discordUser.email, username: `${discordUser.username}_${discordUser.id.slice(-4)}`, avatarUrl },
      update: { email: discordUser.email, avatarUrl },
    });
    await this.recordActivity(user.id, ActivityAction.DISCORD_LOGIN, context);
    return this.issueTokens(user);
  }

  private async fetchDiscordUser(code: string): Promise<DiscordUser> {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: env.DISCORD_REDIRECT_URI }) });
    if (!tokenResponse.ok) throw new Error('Discord token exchange failed');
    const token = (await tokenResponse.json()) as { access_token: string };
    const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { authorization: `Bearer ${token.access_token}` } });
    if (!userResponse.ok) throw new Error('Discord profile fetch failed');
    return (await userResponse.json()) as DiscordUser;
  }

  private async issueTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role as Role });
    const refreshToken = createOpaqueToken();
    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)) } });
    return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
  }

  private async recordActivity(userId: string, action: ActivityAction, context: RequestContext) {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
        ...(context.userAgent ? { userAgent: context.userAgent } : {}),
      },
    });
  }
}
export const authService = new AuthService();
