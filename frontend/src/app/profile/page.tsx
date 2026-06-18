'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { authApi, getAccessToken, getStoredUser } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.push('/login'); return; }
    setUser(getStoredUser());
    authApi.me(token).then(({ user: latest }) => setUser(latest)).catch(() => router.push('/login'));
  }, [router]);

  return (
    <AppShell>
      <p className="eyebrow">Profile</p><h1 className="page-title">Account profile</h1>
      <section className="panel mt-8 max-w-2xl"><div className="flex items-center gap-5"><div className="grid size-20 place-items-center rounded-3xl bg-cyan-500 text-3xl font-black text-white">{user?.email?.[0]?.toUpperCase() ?? 'H'}</div><div><h2 className="text-2xl font-bold">{user?.email ?? 'Loading...'}</h2><p className="muted">Role: {user?.role ?? 'USER'}</p></div></div><dl className="mt-8 grid gap-4 sm:grid-cols-2"><div className="profile-field"><dt>User ID</dt><dd>{user?.id ?? '—'}</dd></div><div className="profile-field"><dt>Email</dt><dd>{user?.email ?? '—'}</dd></div><div className="profile-field"><dt>Role</dt><dd>{user?.role ?? '—'}</dd></div><div className="profile-field"><dt>Realtime</dt><dd>Socket.io enabled</dd></div></dl></section>
    </AppShell>
  );
}
