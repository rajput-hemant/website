import {
  clock,
  compassPoint,
  DAY_END,
  DAY_START,
  describeLight,
  hull,
  lightAt,
  planShadow,
  solar,
} from "@/flavors/maquette/lib/sun";
import { describe, expect, it } from "vitest";

describe("solar", () => {
  it("puts the sun near 60° at Mathura's solar noon in late September", () => {
    // Solar noon in Mathura is about 12:11 IST (longitude 19 minutes, equation of time minus 8); the noon sun stands 90 - 27.49 - 1.3.
    const noon = solar(12 * 60 + 11);
    expect(noon.elevation).toBeGreaterThan(60);
    expect(noon.elevation).toBeLessThan(62);
    expect(Math.abs(noon.azimuth - 180)).toBeLessThan(3);
  });

  it("rises in the east and sets in the west", () => {
    expect(solar(DAY_START).azimuth).toBeGreaterThan(85);
    expect(solar(DAY_START).azimuth).toBeLessThan(100);
    expect(solar(DAY_END).azimuth).toBeGreaterThan(260);
    expect(solar(DAY_END).elevation).toBeLessThan(15);
  });

  it("matches the mock's 15:10 reading", () => {
    const { reading } = describeLight(15 * 60 + 10, false);
    expect(reading).toBe(
      "Mathura, 26 September 2026, 15:10 IST. Sun 38° high, from 244° WSW."
    );
  });

  it("holds the lamp at a fixed height at night", () => {
    expect(lightAt(DAY_START, true).elevation).toBe(50);
    expect(describeLight(600, true).reading).toMatch(/^One spotlight at 50°/);
  });
});

describe("helpers", () => {
  it("names compass points and clock times", () => {
    expect(compassPoint(244)).toBe("WSW");
    expect(compassPoint(359)).toBe("N");
    expect(compassPoint(-90)).toBe("W");
    expect(clock(910)).toBe("15:10");
    expect(clock(420)).toBe("07:00");
  });

  it("finds a convex hull", () => {
    expect(
      hull([
        [0, 0],
        [2, 0],
        [1, 1],
        [2, 2],
        [0, 2],
      ])
    ).toEqual([
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ]);
  });

  it("casts a plan shadow away from the sun", () => {
    // Sun due south at 45°: the shadow runs north (up) by the height.
    const pts = planShadow({ x: 0, y: 10, w: 4, h: 2 }, 5, {
      elevation: 45,
      azimuth: 180,
    })
      .split(" ")
      .map((p) => p.split(",").map(Number));
    const ys = pts.map(([, y]) => y ?? 0);
    expect(Math.min(...ys)).toBeCloseTo(5, 1);
    expect(Math.max(...ys)).toBeCloseTo(12, 1);
  });
});
