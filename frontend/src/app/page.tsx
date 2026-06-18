import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-8 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between"><p className="text-xl font-black text-cyan-500">HyperVerse Cloud</p><ThemeToggle /></div>
      <section className="mx-auto mt-20 max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-12 shadow-2xl dark:border-cyan-400/20 dark:bg-slate-900">
        <p className="eyebrow">Production VPS panel</p>
        <h1 className="mt-6 max-w-3xl text-6xl font-black tracking-tight">Operate virtual infrastructure from one secure control plane.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-300">Login, register, profile management, dark mode, and Socket.io realtime integration are ready for the backend API.</p>
        <div className="mt-10 flex gap-4"><Link className="primary-button" href="/login">Sign in</Link><Link className="rounded-2xl border border-slate-300 px-5 py-3 font-bold dark:border-slate-700" href="/register">Create account</Link></div>
      </section>
    </main>
  );
}
