import { execFile } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type DomainState = 'running' | 'paused' | 'shut off' | 'unknown';

export interface DomainSummary {
  id: string | null;
  name: string;
  state: DomainState | string;
}

export interface DomainMetrics {
  name: string;
  state: DomainState | string;
  cpuTimeNs: number | null;
  memoryKiB: number | null;
  maxMemoryKiB: number | null;
  vcpuCount: number | null;
  blockReadBytes: number;
  blockWriteBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  timestamp: number;
}

export interface CreateDomainInput {
  name: string;
  memoryMiB: number;
  vcpus: number;
  diskPath: string;
  diskSizeGiB?: number;
  isoPath?: string;
  networkBridge?: string;
  autostart?: boolean;
}

const domainNamePattern = /^[a-zA-Z0-9_.:-]{1,64}$/;

function assertDomainName(name: string) {
  if (!domainNamePattern.test(name)) throw new Error('Invalid domain name');
}

async function run(command: string, args: string[]) {
  const { stdout, stderr } = await execFileAsync(command, args, { timeout: 30_000, maxBuffer: 1024 * 1024 * 8 });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function ensureKvmAvailable() {
  await access('/dev/kvm', constants.R_OK | constants.W_OK);
  await run('virsh', ['--version']);
  await run('qemu-img', ['--version']);
}

export async function listDomains(): Promise<DomainSummary[]> {
  const { stdout } = await run('virsh', ['list', '--all']);
  return stdout.split('\n').slice(2).map((line) => line.trim()).filter(Boolean).map((line) => {
    const match = line.match(/^(?:(\S+)\s+)?(\S+)\s+(.+)$/);
    return { id: match?.[1] && match[1] !== '-' ? match[1] : null, name: match?.[2] ?? line, state: match?.[3]?.trim() ?? 'unknown' };
  });
}

export async function startDomain(name: string) {
  assertDomainName(name);
  await run('virsh', ['start', name]);
}

export async function shutdownDomain(name: string) {
  assertDomainName(name);
  await run('virsh', ['shutdown', name]);
}

export async function rebootDomain(name: string) {
  assertDomainName(name);
  await run('virsh', ['reboot', name]);
}

export async function destroyDomain(name: string) {
  assertDomainName(name);
  await run('virsh', ['destroy', name]);
}

export async function undefineDomain(name: string) {
  assertDomainName(name);
  await run('virsh', ['undefine', name, '--remove-all-storage']);
}

export async function createDomain(input: CreateDomainInput) {
  assertDomainName(input.name);
  if (input.memoryMiB < 128) throw new Error('memoryMiB must be at least 128');
  if (input.vcpus < 1) throw new Error('vcpus must be at least 1');

  if (input.diskSizeGiB) {
    await mkdir(dirname(input.diskPath), { recursive: true });
    await run('qemu-img', ['create', '-f', 'qcow2', input.diskPath, `${input.diskSizeGiB}G`]);
  }

  const args = [
    '--name', input.name,
    '--memory', String(input.memoryMiB),
    '--vcpus', String(input.vcpus),
    '--disk', `path=${input.diskPath},format=qcow2,bus=virtio`,
    '--os-variant', 'generic',
    '--graphics', 'none',
    '--noautoconsole',
    '--import',
  ];

  if (input.isoPath) args.push('--cdrom', input.isoPath);
  if (input.networkBridge) args.push('--network', `bridge=${input.networkBridge},model=virtio`);

  await run('virt-install', args);
  if (input.autostart) await run('virsh', ['autostart', input.name]);
}

function fieldValue(text: string, key: string) {
  return text.split('\n').find((line) => line.trim().startsWith(`${key}:`))?.split(':').slice(1).join(':').trim();
}

function numberFrom(text: string, key: string) {
  const value = fieldValue(text, key);
  const match = value?.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

export async function getDomainMetrics(name: string): Promise<DomainMetrics> {
  assertDomainName(name);
  const [state, dominfo, block, net] = await Promise.all([
    run('virsh', ['domstate', name]).catch(() => ({ stdout: 'unknown', stderr: '' })),
    run('virsh', ['dominfo', name]).catch(() => ({ stdout: '', stderr: '' })),
    run('virsh', ['domblkstat', name]).catch(() => ({ stdout: '', stderr: '' })),
    run('virsh', ['domifstat', name]).catch(() => ({ stdout: '', stderr: '' })),
  ]);

  const blockReadBytes = Number(block.stdout.match(/rd_bytes\s+(\d+)/)?.[1] ?? 0);
  const blockWriteBytes = Number(block.stdout.match(/wr_bytes\s+(\d+)/)?.[1] ?? 0);
  const networkRxBytes = Number(net.stdout.match(/rx_bytes\s+(\d+)/)?.[1] ?? 0);
  const networkTxBytes = Number(net.stdout.match(/tx_bytes\s+(\d+)/)?.[1] ?? 0);

  return {
    name,
    state: state.stdout.split('\n')[0] ?? 'unknown',
    cpuTimeNs: numberFrom(dominfo.stdout, 'CPU time') === null ? null : Math.round((numberFrom(dominfo.stdout, 'CPU time') ?? 0) * 1_000_000_000),
    memoryKiB: numberFrom(dominfo.stdout, 'Used memory'),
    maxMemoryKiB: numberFrom(dominfo.stdout, 'Max memory'),
    vcpuCount: numberFrom(dominfo.stdout, 'CPU(s)'),
    blockReadBytes,
    blockWriteBytes,
    networkRxBytes,
    networkTxBytes,
    timestamp: Date.now(),
  };
}
