'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { adminRequest } from '@/lib/admin';
import { getAccessToken } from '@/lib/auth';

type Announcement = { id: string; title: string; body: string; severity: string; audience: string; publishedAt?: string | null };

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  useEffect(() => { const token = getAccessToken(); if (!token) { router.push('/login'); return; } adminRequest<{ announcements: Announcement[] }>('/api/admin/announcements', token).then((data) => setAnnouncements(data.announcements)).catch(() => router.push('/dashboard')); }, [router]);
  return <AppShell><p className="eyebrow">Announcements</p><h1 className="page-title">Broadcasts</h1><section className="mt-8 grid gap-4 lg:grid-cols-2">{announcements.map((item) => <article className="panel" key={item.id}><div className="flex justify-between gap-3"><h2 className="section-title">{item.title}</h2><span className="status-pill">{item.severity}</span></div><p className="muted mt-3">Audience: {item.audience} · {item.publishedAt ? 'Published' : 'Draft'}</p><p className="mt-4 text-slate-600 dark:text-slate-300">{item.body}</p></article>)}</section></AppShell>;
}
