'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hyperverse.theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enabled = stored ? stored === 'dark' : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('hyperverse.theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <button onClick={toggle} className="rounded-full border border-slate-300/30 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 dark:text-slate-100">
      {dark ? '☾ Dark' : '☀ Light'}
    </button>
  );
}
