'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth-card';
import { authApi, saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const session = await authApi.login(String(form.get('email')), String(form.get('password')));
      saveSession(session);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage VPS instances, billing, and realtime host telemetry." footer={{ text: 'Need an account?', href: '/register', label: 'Create one' }}>
      <form onSubmit={submit} className="space-y-4">
        <input className="field" name="email" type="email" placeholder="Email" required />
        <input className="field" name="password" type="password" placeholder="Password" required />
        {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p> : null}
        <button disabled={loading} className="primary-button w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthCard>
  );
}
