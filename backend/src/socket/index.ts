import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: env.CORS_ORIGIN, credentials: true } });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try { socket.data.user = verifyAccessToken(token); return next(); } catch { return next(new Error('Invalid token')); }
  });
  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.user.sub}`);
    socket.emit('connected', { message: 'Connected to HyperVerse Cloud realtime gateway' });
  });
  return io;
}
