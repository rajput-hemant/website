import { describe, expect, it } from "vitest";

import { checkTimeToSubmit } from "../timing";

const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;

describe("checkTimeToSubmit", () => {
  it("rejects submissions under three seconds", () => {
    expect(checkTimeToSubmit(2_999)).toEqual({
      ok: false,
      reason: "too-fast",
      elapsedMs: 2_999,
    });
    expect(checkTimeToSubmit(0)).toMatchObject({
      ok: false,
      reason: "too-fast",
    });
  });

  it("accepts the edges of the window", () => {
    expect(checkTimeToSubmit(3 * SECOND)).toEqual({
      ok: true,
      elapsedMs: 3 * SECOND,
    });
    expect(checkTimeToSubmit(6 * HOUR).ok).toBe(true);
  });

  it("rejects forms left open longer than six hours", () => {
    expect(checkTimeToSubmit(6 * HOUR + 1)).toMatchObject({
      ok: false,
      reason: "too-slow",
    });
  });

  it("uses the window it is given", () => {
    expect(checkTimeToSubmit(50, { minMs: 10, maxMs: 100 }).ok).toBe(true);
    expect(checkTimeToSubmit(5, { minMs: 10, maxMs: 100 }).ok).toBe(false);
  });
});
