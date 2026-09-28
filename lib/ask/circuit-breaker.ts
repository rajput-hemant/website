import { askConfig } from "./config";

/**
 * The global ceiling on waiting submissions: pending ones plus recent spam
 * (see `askConfig.circuitBreaker`).
 *
 * The count is memoised in module scope for `cacheTtlMs`, and callers
 * that arrive while a read is in flight share it, so a flood costs at most one
 * Sanity request per TTL per server process.
 *
 * `'use cache'` needs `cacheComponents`, which is off. `unstable_cache`
 * (superseded by `'use cache'` in Next 16) does work in route handlers, but it
 * serves a stale count while revalidating in the background, so a cleared
 * inbox reopens one request late; it also persists across restarts in
 * `.next/cache` and throws outside a Next request scope. On a single
 * self-hosted process the memo gives the same bound without those costs.
 */

type Clock = () => number;

export type PendingCounter = {
  get(): Promise<number>;
  reset(): void;
};

export function createPendingCounter(
  countPending: () => Promise<number>,
  { ttlMs = askConfig.circuitBreaker.cacheTtlMs, now = Date.now as Clock } = {}
): PendingCounter {
  let cached: { value: number; expiresAt: number } | null = null;
  let inFlight: Promise<number> | null = null;

  return {
    get() {
      if (cached && cached.expiresAt > now()) {
        return Promise.resolve(cached.value);
      }
      inFlight ??= countPending()
        .then((value) => {
          cached = { value, expiresAt: now() + ttlMs };
          return value;
        })
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
    reset() {
      cached = null;
      inFlight = null;
    },
  };
}

export function isCircuitOpen(
  pendingCount: number,
  cap: number = askConfig.circuitBreaker.pendingCap
): boolean {
  return pendingCount >= cap;
}
