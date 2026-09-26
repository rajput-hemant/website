import { toLinear } from "@/flavors/drawing-set/lib/scene/accent";
import {
  fitDistance,
  onBoard,
  TABLE,
} from "@/flavors/drawing-set/lib/scene/poses";
import { describe, expect, it } from "vitest";

describe("toLinear", () => {
  it("matches the sRGB transfer function", () => {
    expect(toLinear(0)).toBe(0);
    expect(toLinear(255)).toBeCloseTo(1, 6);
    expect(toLinear(10)).toBeCloseTo(10 / 255 / 12.92, 6);
    expect(toLinear(128)).toBeCloseTo(0.2158605, 6);
  });
});

describe("fitDistance", () => {
  const t = Math.tan((22 * Math.PI) / 360);
  const visible = (d: number, aspect: number) => {
    const h = (2 * d * t) / 1.08;
    return [h * aspect, h] as const;
  };

  it("keeps the whole frame in view in wide and narrow slots", () => {
    for (const aspect of [0.5, 1, 1.6, 3]) {
      const [w, h] = visible(fitDistance([9.4, 5.1], 22, aspect), aspect);
      expect(w).toBeGreaterThanOrEqual(9.4 - 1e-9);
      expect(h).toBeGreaterThanOrEqual(5.1 - 1e-9);
    }
  });

  it("pulls back to keep a shifted picture inside the far edge", () => {
    const plain = fitDistance([10, 1], 22, 2);
    expect(fitDistance([10, 1], 22, 2, 0.2)).toBeCloseTo(plain / 0.8);
  });
});

describe("onBoard", () => {
  it("maps the board centre to the table and tilts the far edge up", () => {
    expect(onBoard([0, 0, 0])).toEqual([TABLE.x, TABLE.y, TABLE.z]);
    const [, far] = onBoard([0, 0, -1]);
    const [, near] = onBoard([0, 0, 1]);
    expect(far).toBeGreaterThan(TABLE.y);
    expect(near).toBeLessThan(TABLE.y);
    const [x, y, z] = onBoard([0.3, 0.5, 0.7]);
    expect(Math.hypot(x - TABLE.x, y - TABLE.y, z - TABLE.z)).toBeCloseTo(
      Math.hypot(0.3, 0.5, 0.7)
    );
  });
});
