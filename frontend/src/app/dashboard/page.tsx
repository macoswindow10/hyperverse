'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { authApi, getAccessToken, getStoredUser } from '@/lib/auth';
import { connectSocket } from '@/lib/socket';
import type { AuthUser } from '@/types/auth';

const stats = [{ label: 'Active VPS', value: '12' }, { label: 'CPU Load', value: '38%' }, { label: 'Memory Used', value: '64%' }, { label: 'Open Alerts', value: '2' }];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [gatewayMessage, setGatewayMessage] = useState('Awaiting realtime gateway...');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.push('/login'); return; }
    setUser(getStoredUser());
    authApi.me(token).then(({ user: latest }) => setUser(latest)).catch(() => router.push('/login'));
    const socket = connectSocket(token);
    socket.on('connect', () => setSocketStatus('Connected'));
    socket.on('disconnect', () => setSocketStatus('Disconnected'));
    socket.on('connected', (payload: { message: string }) => setGatewayMessage(payload.message));
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('connected'); };
  }, [router]);

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-6"><div><p className="eyebrow">Dashboard</p><h1 className="page-title">Operations overview</h1><p className="muted">Welcome {user?.email ?? 'operator'}.</p></div><span className="status-pill">Socket: {socketStatus}</span></div>
      <section className="mt-8 grid gap-5 md:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="panel"><p className="muted text-sm">{stat.label}</p><p className="mt-3 text-3xl font-black">{stat.value}</p></article>)}</section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]"><article className="panel"><h2 className="section-title">Realtime gateway</h2><p className="mt-4 rounded-2xl bg-cyan-500/10 p-4 text-cyan-500">{gatewayMessage}</p><div className="mt-6 h-56 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30" /></article><article className="panel"><h2 className="section-title">Recent activity</h2><ul className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400"><li>JWT session verified</li><li>Socket.io gateway initialized</li><li>Host agent channel ready</li></ul></article></section>
    </AppShell>
  );
}
