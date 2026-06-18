import { API_BASE_URL } from './config';

export async function adminRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'Admin request failed');
  return payload;
}

export interface AdminOverview {
  users: number;
  invoices: number;
  openTickets: number;
  announcements: number;
  auditLogs: number;
  revenueCents: number;
}
