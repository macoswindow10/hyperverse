import express from 'express';
import { io } from 'socket.io-client';
import si from 'systeminformation';
import { env } from './env.js';

const app = express();
app.use(express.json());

/**
 * Health endpoint (node status + basic hardware info)
 */
app.get('/health', async (_req, res) => {
  try {
    const [cpu, mem, osInfo] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
    ]);

    res.json({
      status: 'ok',
      node: osInfo.hostname,
      cpu: cpu.manufacturer + ' ' + cpu.brand,
      cores: cpu.cores,
      memoryTotal: mem.total,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});

/**
 * Socket connection to backend panel
 */
const socket = io(env.BACKEND_SOCKET_URL, {
  auth: {
    token: env.AGENT_TOKEN,
  },
  transports: ['websocket'],
});

/**
 * Connection events
 */
socket.on('connect', () => {
  console.log('🚀 HyperVerse Agent connected to backend');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection failed:', error.message);
});

/**
 * Real-time stats loop (IMPORTANT for VPS panel graphs)
 */
setInterval(async () => {
  try {
    const [cpuLoad, mem, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
    ]);

    socket.emit('node:stats', {
      cpu: cpuLoad.currentLoad,
      memory: {
        total: mem.total,
        used: mem.active,
      },
      disk: fsSize[0]?.use || 0,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Stats error:', err);
  }
}, 5000);

/**
 * Receive VPS commands from panel (future Prompt 5 integration)
 */
socket.on('vps:action', async (data) => {
  console.log('📦 VPS Action received:', data);

  // later we will connect:
  // startVPS / stopVPS / restartVPS / reinstallVPS
});

/**
 * Start agent server
 */
app.listen(env.AGENT_PORT, () => {
  console.log(`⚡ HyperVerse Agent running on :${env.AGENT_PORT}`);
});
