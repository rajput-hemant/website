import { describe, expect, it, vi } from "vitest";

import { createPendingCounter, isCircuitOpen } from "../circuit-breaker";

describe("createPendingCounter", () => {
  it("shares one read across concurrent callers and reuses it within the TTL", async () => {
    let now = 0;
    const countPending = vi.fn(async () => 7);
    const counter = createPendingCounter(countPending, {
      ttlMs: 30_000,
      now: () => now,
    });

    const burst = await Promise.all(
      Array.from({ length: 100 }, () => counter.get())
    );
    expect(burst.every((count) => count === 7)).toBe(true);
    now = 29_999;
    await counter.get();
    expect(countPending).toHaveBeenCalledTimes(1);

    now = 30_001;
    await counter.get();
    expect(countPending).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed read", async () => {
    const countPending = vi
      .fn<() => Promise<number>>()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(3);
    const counter = createPendingCounter(countPending);

    await expect(counter.get()).rejects.toThrow("down");
    await expect(counter.get()).resolves.toBe(3);
  });
});

describe("isCircuitOpen", () => {
  it("opens at the cap", () => {
    expect(isCircuitOpen(199, 200)).toBe(false);
    expect(isCircuitOpen(200, 200)).toBe(true);
  });
});
