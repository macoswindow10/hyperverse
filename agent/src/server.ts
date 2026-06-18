import express from 'express';
import { env } from './env.js';
import { ensureKvmAvailable, getDomainMetrics, listDomains } from './qemu.js';
import { getStats } from './stats.js';
import { socket } from './socket.js';
import { handleVPSAction, type VPSActionPayload } from './vps.js';

const app = express();
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await ensureKvmAvailable();
    const domains = await listDomains();
    res.json({ status: 'ok', virtualization: 'qemu-kvm', domains: domains.length, timestamp: Date.now() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown health check error';
    res.status(503).json({ status: 'degraded', virtualization: 'unavailable', message });
  }
});

app.get('/stats', async (_req, res) => {
  try {
    res.json(await getStats());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to collect stats';
    res.status(500).json({ status: 'error', message });
  }
});

app.get('/vps', async (_req, res) => {
  res.json({ domains: await listDomains() });
});

app.get('/vps/:name/stats', async (req, res) => {
  try {
    res.json(await getDomainMetrics(req.params.name));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to collect VPS stats';
    res.status(500).json({ status: 'error', message });
  }
});

app.post('/vps/action', async (req, res) => {
  try {
    await handleVPSAction(req.body as VPSActionPayload);
    res.status(202).json({ status: 'accepted' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to run VPS action';
    res.status(400).json({ status: 'error', message });
  }
});

socket.on('connect', () => {
  console.log('🚀 HyperVerse Agent connected to panel');
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket error:', err.message);
});

socket.on('vps:action', async (payload: VPSActionPayload) => {
  try {
    await handleVPSAction(payload);
    socket.emit('vps:action:result', { name: payload.name, action: payload.action, ok: true, timestamp: Date.now() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'VPS execution failed';
    socket.emit('vps:action:result', { name: payload.name, action: payload.action, ok: false, message, timestamp: Date.now() });
  }
});

setInterval(async () => {
  try {
    socket.emit('node:stats', await getStats());
  } catch (err) {
    console.error('Stats error:', err);
  }
}, env.STATS_INTERVAL_MS);

app.listen(env.AGENT_PORT, () => {
  console.log(`⚡ HyperVerse Agent running on port ${env.AGENT_PORT}`);
});
