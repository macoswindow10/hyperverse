import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'HyperVerse Cloud', description: 'Production-grade VPS management panel' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
