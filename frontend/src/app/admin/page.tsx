'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { adminRequest, type AdminOverview } from '@/lib/admin';
import { getAccessToken } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.push('/login'); return; }
    adminRequest<AdminOverview>('/api/admin/overview', token).then(setOverview).catch(() => router.push('/dashboard'));
  }, [router]);

  const cards = [
    ['Users', overview?.users ?? '—'],
    ['Invoices', overview?.invoices ?? '—'],
    ['Open tickets', overview?.openTickets ?? '—'],
    ['Announcements', overview?.announcements ?? '—'],
    ['Audit logs', overview?.auditLogs ?? '—'],
    ['Revenue', overview ? `$${(overview.revenueCents / 100).toFixed(2)}` : '—'],
  ];

  return <AppShell><p className="eyebrow">Admin</p><h1 className="page-title">Control center</h1><section className="mt-8 grid gap-5 md:grid-cols-3">{cards.map(([label, value]) => <article className="panel" key={label}><p className="muted text-sm">{label}</p><p className="mt-3 text-3xl font-black">{value}</p></article>)}</section></AppShell>;
}
