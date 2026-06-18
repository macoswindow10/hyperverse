'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { adminRequest } from '@/lib/admin';
import { getAccessToken } from '@/lib/auth';

type AuditLog = { id: string; action: string; createdAt: string; ipAddress?: string; user?: { email: string; role: string }; metadata?: unknown };

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { const token = getAccessToken(); if (!token) { router.push('/login'); return; } adminRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs', token).then((data) => setLogs(data.logs)).catch(() => router.push('/dashboard')); }, [router]);
  return <AppShell><p className="eyebrow">Audit</p><h1 className="page-title">Audit logs</h1><section className="panel mt-8 overflow-hidden"><div className="divide-y divide-slate-200 dark:divide-slate-800">{logs.map((log) => <div className="grid gap-2 py-4 md:grid-cols-[1fr_1fr_1fr]" key={log.id}><div className="font-semibold">{log.action}</div><div className="muted">{log.user?.email ?? 'System'} · {log.ipAddress ?? 'No IP'}</div><div className="muted md:text-right">{new Date(log.createdAt).toLocaleString()}</div></div>)}</div></section></AppShell>;
}
