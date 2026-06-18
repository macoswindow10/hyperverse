import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function AuthCard({ title, subtitle, footer, children }: { title: string; subtitle: string; footer: { href: string; label: string; text: string }; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="absolute right-6 top-6"><ThemeToggle /></div>
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-cyan-400/20 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-500">HyperVerse</p>
        <h1 className="mt-5 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer.text} <Link className="font-semibold text-cyan-500" href={footer.href}>{footer.label}</Link></p>
      </section>
    </main>
  );
}
