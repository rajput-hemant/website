import { describe, expect, it } from "vitest";

import { pickTier, type TierSignals } from "@/lib/scene/tier";

import {
  detentAngle,
  END_PLAY,
  nearestDetent,
  notched,
  pointerAngle,
  sweepOf,
  withEndStops,
  wrapDelta,
} from "../knob/geometry";

describe("detents", () => {
  it("spaces the five channels 60 degrees apart", () => {
    expect([0, 1, 2, 3, 4].map((i) => detentAngle(5, i))).toEqual([
      -120, -60, 0, 60, 120,
    ]);
  });

  it("spreads many presets across 270 degrees", () => {
    expect(sweepOf(14)).toBe(270);
    expect(detentAngle(14, 0)).toBe(-135);
    expect(detentAngle(14, 13)).toBe(135);
  });

  it("points a single detent straight up", () => {
    expect(detentAngle(1, 0)).toBe(0);
    expect(nearestDetent(1, 90)).toBe(0);
  });

  it("finds the nearest detent and clamps past the ends", () => {
    expect(nearestDetent(5, -35)).toBe(1);
    expect(nearestDetent(5, 29)).toBe(2);
    expect(nearestDetent(5, 400)).toBe(4);
    expect(nearestDetent(5, -400)).toBe(0);
  });

  it("clamps an out of range index", () => {
    expect(detentAngle(5, 9)).toBe(120);
    expect(detentAngle(5, -2)).toBe(-120);
  });
});

describe("dragging", () => {
  it("measures pointer angles clockwise from twelve", () => {
    expect(pointerAngle(0, -1)).toBeCloseTo(0);
    expect(pointerAngle(1, 0)).toBeCloseTo(90);
    expect(pointerAngle(-1, 0)).toBeCloseTo(-90);
  });

  it("folds deltas across six o'clock", () => {
    expect(wrapDelta(350)).toBe(-10);
    expect(wrapDelta(-350)).toBe(10);
    expect(wrapDelta(20)).toBe(20);
  });

  it("gives softly past the end stops and never beyond the play", () => {
    expect(withEndStops(5, 100)).toBe(100);
    const past = withEndStops(5, 150);
    expect(past).toBeGreaterThan(120);
    expect(past).toBeLessThan(120 + END_PLAY);
    expect(withEndStops(5, 10_000)).toBeLessThan(120 + END_PLAY);
    expect(withEndStops(5, -150)).toBeCloseTo(-past);
  });

  it("pulls towards the nearest detent", () => {
    expect(notched(5, -50)).toBeCloseTo(-54);
    expect(notched(5, 60)).toBe(60);
  });
});

describe("pickTier", () => {
  const base: TierSignals = {
    webgl2: true,
    saveData: false,
    reducedData: false,
    scene: "auto",
    deviceMemory: 8,
    coarse: false,
  };

  it("keeps the printed knob when 3D can't or shouldn't run", () => {
    expect(pickTier({ ...base, scene: "off" })).toBe(0);
    expect(pickTier({ ...base, webgl2: false })).toBe(0);
    expect(pickTier({ ...base, saveData: true })).toBe(0);
    expect(pickTier({ ...base, reducedData: true })).toBe(0);
  });

  it("steps down on low power signals", () => {
    expect(pickTier({ ...base, scene: "low" })).toBe(1);
    expect(pickTier({ ...base, deviceMemory: 4 })).toBe(1);
    expect(pickTier({ ...base, coarse: true })).toBe(1);
  });

  it("runs full quality otherwise", () => {
    expect(pickTier(base)).toBe(2);
  });
});
