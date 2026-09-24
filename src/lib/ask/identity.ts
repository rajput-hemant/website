import { createAnonCookieValue, hashIp, verifyAnonCookieValue } from './crypto';

export interface ResolvedIdentity {
  providerId: string;
  newCookieValue: string | null;
}

export function resolveIdentity(
  existingCookieValue: string | undefined,
  ip: string,
  secret: string,
): ResolvedIdentity {
  if (existingCookieValue) {
    const id = verifyAnonCookieValue(existingCookieValue, secret);
    if (id) return { providerId: id, newCookieValue: null };
  }

  const { value } = createAnonCookieValue(secret);
  return { providerId: hashIp(ip, secret), newCookieValue: value };
}
