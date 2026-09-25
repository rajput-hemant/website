import { describe, expect, it } from "vitest";

import { askConfig } from "../config";
import { dailyCap, identityLimit } from "../limits";

const quiet = { open: 0, cooldown: 0, today: 0 };

describe("dailyCap", () => {
  it("is per IP behind a trusted proxy and global otherwise", () => {
    expect(dailyCap(true)).toBe(askConfig.limits.dailyPerIp);
    expect(dailyCap(false)).toBe(askConfig.limits.dailyWithoutTrustedProxy);
  });
});

describe("identityLimit", () => {
  it("allows a quiet identity", () => {
    expect(identityLimit(quiet, 5)).toBeNull();
    expect(identityLimit({ ...quiet, today: 4 }, 5)).toBeNull();
  });

  it("reports the daily cap first, then the open thread, then the cooldown", () => {
    expect(identityLimit({ open: 1, cooldown: 1, today: 5 }, 5)).toBe(
      "daily-cap"
    );
    expect(identityLimit({ ...quiet, open: 1, cooldown: 1 }, 5)).toBe(
      "open-thread"
    );
    expect(identityLimit({ ...quiet, cooldown: 1 }, 5)).toBe("cooldown");
  });
});
