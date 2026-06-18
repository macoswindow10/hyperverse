import { io } from 'socket.io-client';
import { env } from './env.js';

export const socket = io(env.BACKEND_SOCKET_URL, {
  auth: { token: env.AGENT_TOKEN },
  transports: ['websocket'],
});
