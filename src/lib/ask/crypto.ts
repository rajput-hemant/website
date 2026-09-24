import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

function hmac(secret: string, context: string, value: string): string {
  return createHmac('sha256', secret).update(`${context}:${value}`).digest('hex');
}

export function hashIp(ip: string, secret: string): string {
  return createHash('sha256').update(`${secret}:ip:${ip}`).digest('hex').slice(0, 12);
}

export function createAnonCookieValue(secret: string): {
  id: string;
  value: string;
} {
  const id = randomBytes(16).toString('hex');
  const signature = hmac(secret, 'anon-cookie', id);
  return { id, value: `${id}.${signature}` };
}

export function generateSlug(): string {
  return randomBytes(4).toString('hex');
}

export function verifyAnonCookieValue(
  value: string,
  secret: string,
): string | null {
  const [id, signature] = value.split('.');
  if (!id || !signature) return null;

  const expected = hmac(secret, 'anon-cookie', id);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) return null;

  return timingSafeEqual(expectedBuffer, actualBuffer) ? id : null;
}
