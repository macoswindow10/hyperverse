export type UserRole = 'USER' | 'SUPPORT' | 'ADMIN' | 'OWNER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
