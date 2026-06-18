import { Role } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const db = prisma as any;

export const adminRouter = Router();
adminRouter.use(authenticate, requireRole(Role.ADMIN));

adminRouter.get('/overview', asyncHandler(async (_req, res) => {
  const [users, invoices, tickets, announcements, auditLogs] = await Promise.all([
    prisma.user.count(),
    db.invoice.count(),
    db.supportTicket.count({ where: { status: { in: ['OPEN', 'PENDING'] } } }),
    db.announcement.count({ where: { publishedAt: { not: null } } }),
    prisma.activityLog.count(),
  ]);
  const revenue = await db.invoice.aggregate({ _sum: { totalCents: true }, where: { status: 'PAID' } });
  res.json({ users, invoices, openTickets: tickets, announcements, auditLogs, revenueCents: revenue._sum.totalCents ?? 0 });
}));

adminRouter.get('/billing/plans', asyncHandler(async (_req, res) => {
  res.json({ plans: await db.billingPlan.findMany({ orderBy: { createdAt: 'desc' } }) });
}));

adminRouter.post('/billing/plans', asyncHandler(async (req, res) => {
  const plan = await db.billingPlan.create({ data: req.body });
  await db.activityLog.create({ data: { userId: req.user?.id, action: 'BILLING_PLAN_CREATED', metadata: { adminAction: 'billing.plan.created', planId: plan.id } } });
  res.status(201).json({ plan });
}));

adminRouter.get('/billing/invoices', asyncHandler(async (_req, res) => {
  res.json({ invoices: await db.invoice.findMany({ include: { user: { select: { id: true, email: true, username: true } }, plan: true }, orderBy: { createdAt: 'desc' } }) });
}));

adminRouter.post('/billing/invoices', asyncHandler(async (req, res) => {
  const invoice = await db.invoice.create({ data: req.body });
  await db.activityLog.create({ data: { userId: req.user?.id, action: 'INVOICE_CREATED', metadata: { adminAction: 'billing.invoice.created', invoiceId: invoice.id } } });
  res.status(201).json({ invoice });
}));

adminRouter.get('/support/tickets', asyncHandler(async (_req, res) => {
  res.json({ tickets: await db.supportTicket.findMany({ include: { requester: { select: { id: true, email: true, username: true } }, assignee: { select: { id: true, email: true, username: true } }, messages: { orderBy: { createdAt: 'asc' } } }, orderBy: { updatedAt: 'desc' } }) });
}));

adminRouter.post('/support/tickets', asyncHandler(async (req, res) => {
  const ticket = await db.supportTicket.create({ data: { ...req.body, requesterId: req.body.requesterId ?? req.user?.id } });
  res.status(201).json({ ticket });
}));

adminRouter.patch('/support/tickets/:id', asyncHandler(async (req, res) => {
  const ticket = await db.supportTicket.update({ where: { id: req.params.id }, data: req.body });
  res.json({ ticket });
}));

adminRouter.post('/support/tickets/:id/messages', asyncHandler(async (req, res) => {
  const message = await db.supportMessage.create({ data: { ticketId: req.params.id, authorId: req.user?.id, body: req.body.body, internal: Boolean(req.body.internal) } });
  res.status(201).json({ message });
}));

adminRouter.get('/announcements', asyncHandler(async (_req, res) => {
  res.json({ announcements: await db.announcement.findMany({ include: { author: { select: { id: true, email: true, username: true } } }, orderBy: { createdAt: 'desc' } }) });
}));

adminRouter.post('/announcements', asyncHandler(async (req, res) => {
  const announcement = await db.announcement.create({ data: { ...req.body, authorId: req.user?.id, publishedAt: req.body.publish ? new Date() : req.body.publishedAt } });
  res.status(201).json({ announcement });
}));

adminRouter.patch('/announcements/:id', asyncHandler(async (req, res) => {
  const announcement = await db.announcement.update({ where: { id: req.params.id }, data: req.body });
  res.json({ announcement });
}));

adminRouter.get('/audit-logs', asyncHandler(async (_req, res) => {
  res.json({ logs: await prisma.activityLog.findMany({ include: { user: { select: { id: true, email: true, username: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }) });
}));
