import { exec } from "child_process";

export async function startVPS(name: string) {
  return exec(`virsh start ${name}`);
}

export async function stopVPS(name: string) {
  return exec(`virsh shutdown ${name}`);
}

export async function restartVPS(name: string) {
  return exec(`virsh reboot ${name}`);
}

export async function deleteVPS(name: string) {
  return exec(`virsh destroy ${name}`);
}
