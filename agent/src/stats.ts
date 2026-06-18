import si from 'systeminformation';
import { getDomainMetrics, listDomains } from './qemu.js';

export interface NodeStats {
  cpu: { loadPercent: number; cores: number };
  memory: { total: number; used: number; free: number; usedPercent: number };
  disk: { mount: string; size: number; used: number; available: number; usedPercent: number }[];
  network: { interface: string; rxBytes: number; txBytes: number; rxSec: number; txSec: number }[];
  virtualization: { domains: Awaited<ReturnType<typeof getDomainMetrics>>[]; domainCount: number; runningCount: number };
  uptime: number;
  timestamp: number;
}

export async function getStats(): Promise<NodeStats> {
  const [load, mem, disks, network, domains] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    listDomains().catch(() => []),
  ]);

  const domainMetrics = await Promise.all(domains.map((domain) => getDomainMetrics(domain.name)));

  return {
    cpu: { loadPercent: load.currentLoad, cores: load.cpus.length },
    memory: { total: mem.total, used: mem.active, free: mem.available, usedPercent: (mem.active / mem.total) * 100 },
    disk: disks.map((disk) => ({ mount: disk.mount, size: disk.size, used: disk.used, available: disk.available, usedPercent: disk.use })),
    network: network.map((iface) => ({ interface: iface.iface, rxBytes: iface.rx_bytes, txBytes: iface.tx_bytes, rxSec: iface.rx_sec, txSec: iface.tx_sec })),
    virtualization: {
      domains: domainMetrics,
      domainCount: domains.length,
      runningCount: domains.filter((domain) => domain.state === 'running').length,
    },
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
}
