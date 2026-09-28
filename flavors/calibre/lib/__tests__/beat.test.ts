import {
  BEAT_MS,
  DEG_PER_BEAT,
  hourAngle,
  same,
  secondsAngle,
  stepTowards,
} from "@/flavors/calibre/lib/beat";
import { describe, expect, it } from "vitest";

describe("the beat", () => {
  it("beats six times a second, a degree each, so the index turns once a minute", () => {
    expect(BEAT_MS).toBeCloseTo(1000 / 6);
    expect(DEG_PER_BEAT).toBe(1);
    expect(secondsAngle(0)).toBe(0);
    expect(secondsAngle(1000)).toBe(6);
    expect(secondsAngle(30_000)).toBe(180);
    expect(secondsAngle(60_000)).toBe(0);
  });

  it("steps to the last beat, never between beats", () => {
    expect(secondsAngle(BEAT_MS * 2.9)).toBe(2);
  });

  it("puts the nav's marks at XII, III, VI and IX", () => {
    expect([0, 3, 6, 9].map(hourAngle)).toEqual([0, 90, 180, 270]);
  });

  it("jumps an hour a beat towards a mark, the short way, and lands on it", () => {
    const path = [10];
    while (!same(path.at(-1) ?? 0, 270)) {
      path.push(stepTowards(path.at(-1) ?? 0, 270));
      if (path.length > 12) break;
    }
    expect(path).toEqual([10, -20, -50, -80, -90]);
    expect(same(-90, 270)).toBe(true);
  });

  it("goes forward when forward is shorter", () => {
    expect(stepTowards(0, 90)).toBe(30);
    expect(stepTowards(80, 90)).toBe(90);
  });
});
