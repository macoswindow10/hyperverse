import type { AuthResponse, AuthUser } from '@/types/auth';
import { API_BASE_URL } from './config';

const ACCESS_TOKEN_KEY = 'hyperverse.accessToken';
const REFRESH_TOKEN_KEY = 'hyperverse.refreshToken';
const USER_KEY = 'hyperverse.user';

export function saveSession(session: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'Request failed');
  return payload;
}

export const authApi = {
  login: (email: string, password: string) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, username: string, password: string) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),
  logout: (refreshToken: string) => request<{ success: boolean }>('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  me: (accessToken: string) => request<{ user: AuthUser }>('/api/auth/me', { method: 'GET', headers: { authorization: `Bearer ${accessToken}` } }),
};
