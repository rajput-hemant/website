import { describe, expect, it } from "vitest";

import { layTape } from "../tape";

const today = new Date(2026, 8, 15);

describe("layTape", () => {
  const tape = layTape(
    [
      { id: "now", startDate: "2026-01-01" },
      { id: "old", startDate: "2024-06-01", endDate: "2025-09-01" },
    ],
    today
  );

  it("runs from the first start year to the end of this year", () => {
    expect(tape.years.map((y) => y.year)).toEqual([2024, 2025, 2026]);
    expect(tape.years[0]!.left).toBe(0);
    expect(tape.years[1]!.left).toBeCloseTo(1 / 3);
  });

  it("places a finished role through its last month", () => {
    const old = tape.clips[1]!;
    expect(old.left).toBeCloseTo(5 / 36);
    expect(old.width).toBeCloseTo(16 / 36);
    expect(old.ongoing).toBe(false);
  });

  it("runs an ongoing role to today and puts the playhead there", () => {
    const now = tape.clips[0]!;
    expect(now.ongoing).toBe(true);
    expect(now.left + now.width).toBeCloseTo(33 / 36);
    expect(tape.now).toBeGreaterThan(32 / 36);
    expect(tape.now).toBeLessThan(33 / 36);
  });

  it("never lets a clip vanish or run off the tape", () => {
    const single = layTape([{ id: "x", startDate: "2026-09-01" }], today);
    expect(single.clips[0]!.width).toBeGreaterThan(0);
    expect(single.clips[0]!.left + single.clips[0]!.width).toBeLessThanOrEqual(
      1
    );
  });
});
