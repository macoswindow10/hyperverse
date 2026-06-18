import express from 'express';
import { io } from 'socket.io-client';
import si from 'systeminformation';
import { env } from './env.js';

const app = express();
app.get('/health', async (_req, res) => {
  const [cpu, mem] = await Promise.all([si.cpu(), si.mem()]);
  res.json({ status: 'ok', cpu: cpu.manufacturer, memoryTotal: mem.total });
});

const socket = io(env.BACKEND_SOCKET_URL, { auth: { token: env.AGENT_TOKEN }, transports: ['websocket'] });
socket.on('connect', () => console.log('Agent connected to backend gateway'));
socket.on('connect_error', (error) => console.error('Agent socket connection failed:', error.message));

app.listen(env.AGENT_PORT, () => console.log(`HyperVerse Agent listening on :${env.AGENT_PORT}`));
