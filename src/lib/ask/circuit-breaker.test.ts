import { describe, expect, it } from 'vitest';
import { exceedsCircuitBreakerCap } from './circuit-breaker';
import { askConfig } from './config';

describe('exceedsCircuitBreakerCap', () => {
  it('is false one below the cap', () => {
    expect(
      exceedsCircuitBreakerCap(askConfig.circuitBreaker.cap - 1),
    ).toBe(false);
  });

  it('is true exactly at the cap', () => {
    expect(exceedsCircuitBreakerCap(askConfig.circuitBreaker.cap)).toBe(true);
  });

  it('is true above the cap', () => {
    expect(
      exceedsCircuitBreakerCap(askConfig.circuitBreaker.cap + 1),
    ).toBe(true);
  });

  it('is false for zero open questions', () => {
    expect(exceedsCircuitBreakerCap(0)).toBe(false);
  });
});
