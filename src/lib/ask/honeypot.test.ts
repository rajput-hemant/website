import { describe, expect, it } from 'vitest';
import { isElapsedWithinWindow, isHoneypotTriggered } from './honeypot';

describe('isHoneypotTriggered', () => {
  it('is false when empty', () => {
    expect(isHoneypotTriggered('')).toBe(false);
  });

  it('is false when only whitespace', () => {
    expect(isHoneypotTriggered('   ')).toBe(false);
  });

  it('is true when a bot fills it in', () => {
    expect(isHoneypotTriggered('  filled  ')).toBe(true);
  });
});

describe('isElapsedWithinWindow', () => {
  const min = 3_000;
  const max = 6 * 60 * 60 * 1000;
  const now = Date.now();

  it('is true comfortably inside the window', () => {
    expect(isElapsedWithinWindow(now - 4_000, now, min, max)).toBe(true);
  });

  it('is false when submitted too fast', () => {
    expect(isElapsedWithinWindow(now - 1_000, now, min, max)).toBe(false);
  });

  it('is false when the form was left open too long', () => {
    expect(isElapsedWithinWindow(now - 7 * 3_600_000, now, min, max)).toBe(
      false,
    );
  });

  it('is true exactly at the lower bound', () => {
    expect(isElapsedWithinWindow(now - min, now, min, max)).toBe(true);
  });

  it('is true exactly at the upper bound', () => {
    expect(isElapsedWithinWindow(now - max, now, min, max)).toBe(true);
  });
});
