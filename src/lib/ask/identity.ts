import { createAnonCookieValue, verifyAnonCookieValue } from './crypto';

export type AnonIdentity = {
  providerId: `anon:${string}`;
  newCookieValue: string | null;
};

export function resolveAnonIdentity(
  existingCookieValue: string | undefined,
  secret: string,
): AnonIdentity {
  const existing = existingCookieValue
    ? verifyAnonCookieValue(existingCookieValue, secret)
    : null;
  if (existing) return { providerId: `anon:${existing}`, newCookieValue: null };

  const { id, value } = createAnonCookieValue(secret);
  return { providerId: `anon:${id}`, newCookieValue: value };
}
