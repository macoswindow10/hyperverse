import express from 'express';
import si from 'systeminformation';
import { env } from './env.js';
import { socket } from './socket.js';
import {
  startVPS,
  stopVPS,
  restartVPS,
  deleteVPS,
} from './vps.js';

const app = express();
app.use(express.json());

/**
 * ----------------------
 * HEALTH CHECK
 * ----------------------
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
      cpu: cpu.brand,
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
 * ----------------------
 * SOCKET CONNECTION
 * ----------------------
 */

socket.on('connect', () => {
  console.log('🚀 HyperVerse Agent connected to panel');
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket error:', err.message);
});

/**
 * ----------------------
 * VPS ACTION HANDLER
 * ----------------------
 */
socket.on('vps:action', async (data) => {
  const { action, name } = data;

  console.log(`📦 VPS Action: ${action} -> ${name}`);

  try {
    switch (action) {
      case 'start':
        await startVPS(name);
        break;

      case 'stop':
        await stopVPS(name);
        break;

      case 'restart':
        await restartVPS(name);
        break;

      case 'delete':
        await deleteVPS(name);
        break;

      default:
        console.log('Unknown VPS action:', action);
    }
  } catch (err) {
    console.error('VPS execution failed:', err);
  }
});

/**
 * ----------------------
 * REAL-TIME STATS LOOP
 * ----------------------
 */
setInterval(async () => {
  try {
    const load = await si.currentLoad();
    const mem = await si.mem();
    const disk = await si.fsSize();

    socket.emit('node:stats', {
      cpu: load.currentLoad,
      memory: {
        total: mem.total,
        used: mem.active,
      },
      disk: disk[0]?.use || 0,
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Stats error:', err);
  }
}, 5000);

/**
 * ----------------------
 * START SERVER
 * ----------------------
 */
app.listen(env.AGENT_PORT, () => {
  console.log(`⚡ HyperVerse Agent running on port ${env.AGENT_PORT}`);
});
