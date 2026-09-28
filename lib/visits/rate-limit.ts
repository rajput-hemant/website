/**
 * A fixed-window counter per key, in process memory. Good enough to stop one
 * client hammering the endpoint on a single server; it resets on restart and
 * is not shared between instances, which is acceptable for a visitor counter.
 */
export type RateLimiter = {
  /** Records a hit; false when `key` is over `limit` in the current window. */
  take(key: string, limit: number, now: number): boolean;
};

export function createRateLimiter(options: {
  windowMs: number;
  maxKeys: number;
}): RateLimiter {
  const windows = new Map<string, { start: number; hits: number }>();

  return {
    take(key, limit, now) {
      const current = windows.get(key);
      if (current && now - current.start < options.windowMs) {
        current.hits += 1;
        return current.hits <= limit;
      }

      windows.delete(key);
      if (windows.size >= options.maxKeys) {
        // Maps iterate in insertion order, so the first key is the oldest window.
        const oldest = windows.keys().next();
        if (!oldest.done) windows.delete(oldest.value);
      }
      windows.set(key, { start: now, hits: 1 });
      return limit >= 1;
    },
  };
}
