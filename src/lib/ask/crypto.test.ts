import { describe, expect, it } from 'vitest';
import {
  createAnonCookieValue,
  generateSlug,
  hashIp,
  verifyAnonCookieValue,
} from './crypto';

const secret = 'test-secret-do-not-use-in-production-00000000';

describe('hashIp', () => {
  it('is deterministic for the same ip and secret', () => {
    expect(hashIp('1.2.3.4', secret)).toBe(hashIp('1.2.3.4', secret));
  });

  it('differs for different ips', () => {
    expect(hashIp('1.2.3.4', secret)).not.toBe(hashIp('5.6.7.8', secret));
  });

  it('differs for different secrets', () => {
    expect(hashIp('1.2.3.4', secret)).not.toBe(
      hashIp('1.2.3.4', 'a-different-secret-00000000000000000000'),
    );
  });
});

describe('anon cookie signing', () => {
  it('round-trips a freshly created cookie value', () => {
    const cookie = createAnonCookieValue(secret);
    expect(verifyAnonCookieValue(cookie.value, secret)).toBe(cookie.id);
  });

  it('rejects a tampered signature', () => {
    const cookie = createAnonCookieValue(secret);
    expect(verifyAnonCookieValue(`${cookie.value}x`, secret)).toBeNull();
  });

  it('rejects a value with no separator', () => {
    expect(verifyAnonCookieValue('garbage', secret)).toBeNull();
  });

  it('rejects a value signed with a different secret', () => {
    const cookie = createAnonCookieValue(secret);
    expect(
      verifyAnonCookieValue(cookie.value, 'a-different-secret-000000000000'),
    ).toBeNull();
  });
});

describe('generateSlug', () => {
  it('produces an 8-character hex id', () => {
    expect(generateSlug()).toMatch(/^[0-9a-f]{8}$/);
  });

  it('produces different ids across calls', () => {
    expect(generateSlug()).not.toBe(generateSlug());
  });
});
