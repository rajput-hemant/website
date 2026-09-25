import { describe, expect, it } from 'vitest';
import { createAnonCookieValue, hashIp, verifyAnonCookieValue } from './crypto';
import { resolveIdentity } from './identity';

const secret = 'test-secret-do-not-use-in-production-00000000';

describe('resolveIdentity', () => {
  it('falls back to a stable ip hash when there is no cookie', () => {
    const identity = resolveIdentity(undefined, '1.2.3.4', secret);
    expect(identity.providerId).toBe(hashIp('1.2.3.4', secret));
    expect(identity.newCookieValue).not.toBeNull();
  });

  it('issues a cookie value that itself verifies to the returned providerId', () => {
    const identity = resolveIdentity(undefined, '1.2.3.4', secret);
    expect(identity.newCookieValue).not.toBeNull();
    const verified = verifyAnonCookieValue(
      identity.newCookieValue ?? '',
      secret,
    );
    expect(verified).not.toBeNull();
  });

  it('trusts a valid existing cookie over the ip', () => {
    const cookie = createAnonCookieValue(secret);
    const identity = resolveIdentity(cookie.value, '9.9.9.9', secret);
    expect(identity.providerId).toBe(cookie.id);
    expect(identity.newCookieValue).toBeNull();
  });

  it('falls back to the ip hash when the cookie is tampered with', () => {
    const cookie = createAnonCookieValue(secret);
    const identity = resolveIdentity(`${cookie.value}x`, '1.2.3.4', secret);
    expect(identity.providerId).toBe(hashIp('1.2.3.4', secret));
    expect(identity.newCookieValue).not.toBeNull();
  });
});
