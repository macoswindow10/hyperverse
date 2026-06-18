import { createServer } from 'node:http';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { createApp } from './app.js';
import { createSocketServer } from './socket/index.js';

const app = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => console.log(`HyperVerse Cloud API listening on :${env.PORT}`));

async function shutdown() {
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
