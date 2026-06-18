'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { adminRequest } from '@/lib/admin';
import { getAccessToken } from '@/lib/auth';

type Ticket = { id: string; subject: string; status: string; priority: string; requester?: { email: string }; updatedAt: string; messages: { id: string; body: string; internal: boolean }[] };

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => { const token = getAccessToken(); if (!token) { router.push('/login'); return; } adminRequest<{ tickets: Ticket[] }>('/api/admin/support/tickets', token).then((data) => setTickets(data.tickets)).catch(() => router.push('/dashboard')); }, [router]);
  return <AppShell><p className="eyebrow">Support</p><h1 className="page-title">Ticket queue</h1><section className="mt-8 space-y-4">{tickets.map((ticket) => <article className="panel" key={ticket.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="section-title">{ticket.subject}</h2><p className="muted">{ticket.requester?.email ?? 'Unknown requester'} · {ticket.messages.length} messages</p></div><div className="flex gap-2"><span className="status-pill">{ticket.priority}</span><span className="status-pill">{ticket.status}</span></div></div></article>)}</section></AppShell>;
}
