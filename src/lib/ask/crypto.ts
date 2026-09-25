import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ANON_ID = /^[0-9a-f]{32}$/;
const SIGNATURE = /^[0-9a-f]{64}$/;

function hmac(secret: string, context: string, value: string): string {
  return createHmac('sha256', secret)
    .update(`${context}:${value}`)
    .digest('hex');
}

export function hashIp(ip: string, secret: string): string {
  return hmac(secret, 'ip', ip).slice(0, 16);
}

export function avatarSeed(providerId: string, secret: string): string {
  return hmac(secret, 'avatar', providerId).slice(0, 12);
}

export function createAnonCookieValue(secret: string): {
  id: string;
  value: string;
} {
  const id = randomBytes(16).toString('hex');
  return { id, value: `${id}.${hmac(secret, 'anon-cookie', id)}` };
}

export function generateSlug(): string {
  return randomBytes(4).toString('hex');
}

export function generateId(): string {
  return randomBytes(12).toString('hex');
}

export function verifyAnonCookieValue(
  value: string,
  secret: string,
): string | null {
  const [id, signature, ...rest] = value.split('.');
  if (!id || !signature || rest.length > 0) return null;
  if (!ANON_ID.test(id) || !SIGNATURE.test(signature)) return null;

  const expected = Buffer.from(hmac(secret, 'anon-cookie', id), 'hex');
  return timingSafeEqual(expected, Buffer.from(signature, 'hex')) ? id : null;
}
