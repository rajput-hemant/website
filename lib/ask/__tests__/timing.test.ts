import { describe, expect, it } from "vitest";

import { checkTimeToSubmit } from "../timing";

const mountedAt = 1_700_000_000_000;
const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;

describe("checkTimeToSubmit", () => {
  it("rejects submissions under three seconds", () => {
    expect(checkTimeToSubmit(mountedAt, mountedAt + 2_999)).toEqual({
      ok: false,
      reason: "too-fast",
      elapsedMs: 2_999,
    });
  });

  it("treats a mount time in the future as too fast", () => {
    expect(checkTimeToSubmit(mountedAt + SECOND, mountedAt)).toMatchObject({
      ok: false,
      reason: "too-fast",
    });
  });

  it("accepts the edges of the window", () => {
    expect(checkTimeToSubmit(mountedAt, mountedAt + 3 * SECOND).ok).toBe(true);
    expect(checkTimeToSubmit(mountedAt, mountedAt + 6 * HOUR).ok).toBe(true);
  });

  it("rejects forms left open longer than six hours", () => {
    expect(
      checkTimeToSubmit(mountedAt, mountedAt + 6 * HOUR + 1)
    ).toMatchObject({
      ok: false,
      reason: "too-slow",
    });
  });
});
