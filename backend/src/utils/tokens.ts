import crypto from 'node:crypto';

export function createOpaqueToken(byteLength = 48): string {
  return crypto.randomBytes(byteLength).toString('base64url');
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid duration: ${duration}`);
  const [, rawValue, unit] = match;
  const value = Number(rawValue);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  return value * multipliers[unit as keyof typeof multipliers];
}
