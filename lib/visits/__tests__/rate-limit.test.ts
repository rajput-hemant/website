import { describe, expect, it } from "vitest";

import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
  it("allows `limit` hits per window, then resets", () => {
    const limiter = createRateLimiter({ windowMs: 1_000, maxKeys: 10 });
    expect(limiter.take("a", 2, 0)).toBe(true);
    expect(limiter.take("a", 2, 10)).toBe(true);
    expect(limiter.take("a", 2, 20)).toBe(false);
    expect(limiter.take("b", 2, 20)).toBe(true);
    expect(limiter.take("a", 2, 1_000)).toBe(true);
  });

  it("forgets the oldest key past maxKeys", () => {
    const limiter = createRateLimiter({ windowMs: 1_000, maxKeys: 2 });
    limiter.take("a", 1, 0);
    limiter.take("b", 1, 0);
    limiter.take("c", 1, 0);
    expect(limiter.take("a", 1, 1)).toBe(true);
    expect(limiter.take("c", 1, 1)).toBe(false);
  });
});
