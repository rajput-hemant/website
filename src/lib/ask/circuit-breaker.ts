import { askConfig } from './config';

export function exceedsCircuitBreakerCap(openQuestionCount: number): boolean {
  return openQuestionCount >= askConfig.circuitBreaker.cap;
}
