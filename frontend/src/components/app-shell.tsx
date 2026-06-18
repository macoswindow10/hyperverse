import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white"><Sidebar /><section className="flex-1 p-8">{children}</section></main>;
}
