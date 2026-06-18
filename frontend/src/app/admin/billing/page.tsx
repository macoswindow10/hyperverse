'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { adminRequest } from '@/lib/admin';
import { getAccessToken } from '@/lib/auth';

type Invoice = { id: string; number: string; status: string; totalCents: number; currency: string; user?: { email: string }; createdAt: string };
type Plan = { id: string; name: string; priceCents: number; currency: string; interval: string; isActive: boolean };

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.push('/login'); return; }
    Promise.all([
      adminRequest<{ plans: Plan[] }>('/api/admin/billing/plans', token),
      adminRequest<{ invoices: Invoice[] }>('/api/admin/billing/invoices', token),
    ]).then(([planData, invoiceData]) => { setPlans(planData.plans); setInvoices(invoiceData.invoices); }).catch(() => router.push('/dashboard'));
  }, [router]);
  return <AppShell><p className="eyebrow">Billing</p><h1 className="page-title">Plans and invoices</h1><section className="mt-8 grid gap-6 lg:grid-cols-2"><article className="panel"><h2 className="section-title">Plans</h2><div className="mt-4 space-y-3">{plans.map((plan) => <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800" key={plan.id}><div className="font-bold">{plan.name}</div><p className="muted">{plan.currency} {(plan.priceCents / 100).toFixed(2)} / {plan.interval.toLowerCase()}</p></div>)}</div></article><article className="panel"><h2 className="section-title">Invoices</h2><div className="mt-4 space-y-3">{invoices.map((invoice) => <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800" key={invoice.id}><div className="flex justify-between"><span className="font-bold">{invoice.number}</span><span className="status-pill">{invoice.status}</span></div><p className="muted">{invoice.user?.email ?? 'Unknown'} · {invoice.currency} {(invoice.totalCents / 100).toFixed(2)}</p></div>)}</div></article></section></AppShell>;
}
