import { describe, expect, it } from 'vitest';
import {
  getClientIp,
  isJsonRequest,
  isSameOrigin,
  type HeaderReader,
} from './request';

function headersFrom(values: Record<string, string>): HeaderReader {
  const map = new Map(Object.entries(values));
  return { get: (name) => map.get(name) ?? null };
}

describe('getClientIp', () => {
  it('prefers x-real-ip over x-forwarded-for', () => {
    const headers = headersFrom({
      'x-real-ip': '1.1.1.1',
      'x-forwarded-for': '2.2.2.2',
    });
    expect(getClientIp(headers)).toBe('1.1.1.1');
  });

  it('falls back to the trimmed first x-forwarded-for entry', () => {
    const headers = headersFrom({ 'x-forwarded-for': '  2.2.2.2  , 3.3.3.3' });
    expect(getClientIp(headers)).toBe('2.2.2.2');
  });

  it('falls back to unknown when neither header is present', () => {
    expect(getClientIp(headersFrom({}))).toBe('unknown');
  });
});

describe('isSameOrigin', () => {
  it('accepts a matching origin and host', () => {
    const headers = headersFrom({
      origin: 'https://a.example',
      host: 'a.example',
    });
    expect(isSameOrigin(headers)).toBe(true);
  });

  it('refuses a cross-origin, missing or malformed origin', () => {
    expect(
      isSameOrigin(
        headersFrom({ origin: 'https://evil.example', host: 'a.example' }),
      ),
    ).toBe(false);
    expect(isSameOrigin(headersFrom({ host: 'a.example' }))).toBe(false);
    expect(
      isSameOrigin(headersFrom({ origin: 'not a url', host: 'a.example' })),
    ).toBe(false);
  });
});

describe('isJsonRequest', () => {
  it('accepts application/json with parameters and refuses other types', () => {
    expect(
      isJsonRequest(
        headersFrom({ 'content-type': 'application/json; charset=utf-8' }),
      ),
    ).toBe(true);
    expect(isJsonRequest(headersFrom({ 'content-type': 'text/plain' }))).toBe(
      false,
    );
    expect(isJsonRequest(headersFrom({}))).toBe(false);
  });
});
