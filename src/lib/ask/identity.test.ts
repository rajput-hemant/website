import { describe, expect, it } from 'vitest';
import { createAnonCookieValue, verifyAnonCookieValue } from './crypto';
import { resolveAnonIdentity } from './identity';

const secret = 'test-secret-do-not-use-in-production-00000000';

describe('resolveAnonIdentity', () => {
  it('keys a new visitor by the id in the cookie they are issued', () => {
    const identity = resolveAnonIdentity(undefined, secret);
    expect(identity.newCookieValue).not.toBeNull();
    const id = verifyAnonCookieValue(identity.newCookieValue ?? '', secret);
    expect(identity.providerId).toBe(`anon:${id}`);
  });

  it('trusts a valid existing cookie', () => {
    const cookie = createAnonCookieValue(secret);
    const identity = resolveAnonIdentity(cookie.value, secret);
    expect(identity.providerId).toBe(`anon:${cookie.id}`);
    expect(identity.newCookieValue).toBeNull();
  });

  it('issues a fresh cookie when the existing one is tampered with', () => {
    const cookie = createAnonCookieValue(secret);
    const identity = resolveAnonIdentity(`${cookie.value}x`, secret);
    expect(identity.providerId).not.toBe(`anon:${cookie.id}`);
    expect(identity.newCookieValue).not.toBeNull();
  });
});
