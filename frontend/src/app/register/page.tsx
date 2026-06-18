'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth-card';
import { authApi, saveSession } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const session = await authApi.register(String(form.get('email')), String(form.get('username')), String(form.get('password')));
      saveSession(session);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create your cloud" subtitle="Register with a strong password to start operating HyperVerse Cloud." footer={{ text: 'Already have an account?', href: '/login', label: 'Sign in' }}>
      <form onSubmit={submit} className="space-y-4">
        <input className="field" name="email" type="email" placeholder="Email" required />
        <input className="field" name="username" placeholder="Username" minLength={3} required />
        <input className="field" name="password" type="password" placeholder="Password, 12+ characters" minLength={12} required />
        {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p> : null}
        <button disabled={loading} className="primary-button w-full">{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthCard>
  );
}
