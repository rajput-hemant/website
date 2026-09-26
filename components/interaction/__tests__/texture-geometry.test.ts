import { describe, expect, it } from "vitest";

import {
  parallaxShift,
  SPOT_RADIUS_PX,
  spotOffset,
  spotPatternOffset,
} from "../texture-geometry";

describe("parallaxShift", () => {
  it("stays within one tile, so the overhang never shows an edge", () => {
    for (const tile of [22, 32, 200]) {
      for (let scrollY = 0; scrollY < 5000; scrollY += 7.3) {
        const shift = parallaxShift(scrollY, tile, 0.9);
        expect(shift).toBeLessThanOrEqual(0);
        expect(shift).toBeGreaterThan(-tile);
      }
    }
  });

  it("moves at the given share of the scroll until it wraps", () => {
    expect(parallaxShift(10, 32, 0.9)).toBeCloseTo(-9);
    expect(parallaxShift(40, 32, 0.9)).toBeCloseTo(-4);
  });

  it("is exactly 0 at the top and without a tile", () => {
    expect(Object.is(parallaxShift(0, 32, 0.9), 0)).toBe(true);
    expect(parallaxShift(500, 0, 0.9)).toBe(0);
    expect(parallaxShift(500, Number.NaN, 0.9)).toBe(0);
  });
});

describe("spotlight offsets", () => {
  it("centres the spotlight box on the pointer", () => {
    expect(spotOffset(700, 400)).toEqual({
      x: 700 - SPOT_RADIUS_PX,
      y: 400 - SPOT_RADIUS_PX,
    });
  });

  it("keeps the lit pattern registered with the base pattern", () => {
    // Box offset plus counter-move is the base pattern's own offset: (0, shift).
    for (const [x, y, shift] of [
      [0, 0, 0],
      [700, 400, -12.5],
      [1439, 899, -31],
    ] as const) {
      const box = spotOffset(x, y);
      const inner = spotPatternOffset(x, y, shift);
      expect(box.x + inner.x).toBe(0);
      expect(box.y + inner.y).toBe(shift);
    }
  });
});
