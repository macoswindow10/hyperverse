import si from 'systeminformation';

export async function getStats() {
  const load = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();

  return {
    cpu: load.currentLoad,
    memory: {
      total: mem.total,
      used: mem.active,
    },
    disk: disk[0]?.use || 0,
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
}
