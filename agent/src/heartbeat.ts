import { socket } from './socket.js';

export function startHeartbeat() {
  setInterval(() => {
    socket.emit('node:heartbeat', {
      status: 'online',
      timestamp: Date.now(),
    });
  }, 10000);
}
