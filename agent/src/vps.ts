import { createDomain, destroyDomain, rebootDomain, shutdownDomain, startDomain, undefineDomain, type CreateDomainInput } from './qemu.js';

export type VPSAction = 'create' | 'start' | 'stop' | 'restart' | 'delete' | 'destroy';

export interface VPSActionPayload extends Partial<CreateDomainInput> {
  action: VPSAction;
  name: string;
  purgeStorage?: boolean;
}

export async function handleVPSAction(payload: VPSActionPayload) {
  switch (payload.action) {
    case 'create':
      if (!payload.diskPath) throw new Error('diskPath is required');
      await createDomain({
        name: payload.name,
        memoryMiB: payload.memoryMiB ?? 1024,
        vcpus: payload.vcpus ?? 1,
        diskPath: payload.diskPath,
        diskSizeGiB: payload.diskSizeGiB,
        isoPath: payload.isoPath,
        networkBridge: payload.networkBridge,
        autostart: payload.autostart,
      });
      return;
    case 'start':
      await startDomain(payload.name);
      return;
    case 'stop':
      await shutdownDomain(payload.name);
      return;
    case 'restart':
      await rebootDomain(payload.name);
      return;
    case 'destroy':
      await destroyDomain(payload.name);
      return;
    case 'delete':
      if (payload.purgeStorage) await undefineDomain(payload.name);
      else await destroyDomain(payload.name);
      return;
  }
}
