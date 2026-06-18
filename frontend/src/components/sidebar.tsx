'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getRefreshToken, authApi } from '@/lib/auth';
import { disconnectSocket } from '@/lib/socket';
import { ThemeToggle } from './theme-toggle';

const nav = [{ href: '/dashboard', label: 'Dashboard' }, { href: '/profile', label: 'Profile' }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined);
    disconnectSocket();
    clearSession();
    router.push('/login');
  }

  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <Link href="/dashboard" className="text-2xl font-black tracking-tight text-cyan-500">HyperVerse</Link>
      <nav className="mt-10 space-y-2">
        {nav.map((item) => <Link key={item.href} href={item.href} className={`block rounded-2xl px-4 py-3 font-semibold transition ${pathname === item.href ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>{item.label}</Link>)}
      </nav>
      <div className="mt-auto space-y-4"><ThemeToggle /><button onClick={logout} className="w-full rounded-2xl border border-red-400/40 px-4 py-3 font-semibold text-red-500 hover:bg-red-500 hover:text-white">Sign out</button></div>
    </aside>
  );
}
