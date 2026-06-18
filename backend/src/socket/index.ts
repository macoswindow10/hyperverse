import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';

const adminRoles = new Set(['ADMIN', 'OWNER']);

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: env.CORS_ORIGIN, credentials: true } });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));

    if (env.AGENT_TOKEN && token === env.AGENT_TOKEN) {
      socket.data.agent = { type: 'node-agent' };
      return next();
    }

    try {
      socket.data.user = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.agent) {
      socket.join('agents');
      socket.emit('connected', { message: 'Connected to HyperVerse Cloud agent gateway' });
      socket.on('node:stats', (stats) => socket.to('admins').emit('node:stats', stats));
      socket.on('vps:action:result', (result) => socket.to('admins').emit('vps:action:result', result));
      return;
    }

    socket.join(`user:${socket.data.user.sub}`);
    if (adminRoles.has(socket.data.user.role)) socket.join('admins');
    socket.emit('connected', { message: 'Connected to HyperVerse Cloud realtime gateway' });
  });

  return io;
}
