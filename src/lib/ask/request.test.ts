import { describe, expect, it } from 'vitest';
import { getClientIp, type HeaderReader } from './request';

function headersFrom(values: Record<string, string>): HeaderReader {
  const map = new Map(Object.entries(values));
  return { get: (name) => map.get(name) ?? null };
}

describe('getClientIp', () => {
  it('takes the first entry of x-forwarded-for', () => {
    const headers = headersFrom({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' });
    expect(getClientIp(headers)).toBe('1.1.1.1');
  });

  it('trims whitespace around the first entry', () => {
    const headers = headersFrom({ 'x-forwarded-for': '  1.1.1.1  , 2.2.2.2' });
    expect(getClientIp(headers)).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = headersFrom({ 'x-real-ip': '3.3.3.3' });
    expect(getClientIp(headers)).toBe('3.3.3.3');
  });

  it('falls back to 0.0.0.0 when neither header is present', () => {
    expect(getClientIp(headersFrom({}))).toBe('0.0.0.0');
  });
});
