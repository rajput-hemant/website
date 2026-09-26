import { toLinear } from "@/flavors/drawing-set/lib/scene/accent";
import { fitDistance } from "@/flavors/drawing-set/lib/scene/poses";
import {
  pickTier,
  type TierSignals,
} from "@/flavors/drawing-set/lib/scene/tier";
import { describe, expect, it } from "vitest";

const base: TierSignals = {
  webgl2: true,
  saveData: false,
  reducedData: false,
  scene: "auto",
  deviceMemory: 8,
  coarse: false,
};

describe("pickTier", () => {
  it.each<[Partial<TierSignals>, number]>([
    [{}, 2],
    [{ scene: "off" }, 0],
    [{ webgl2: false }, 0],
    [{ saveData: true }, 0],
    [{ reducedData: true }, 0],
    [{ scene: "low" }, 1],
    [{ deviceMemory: 4 }, 1],
    [{ coarse: true }, 1],
  ])("%o -> T%i", (patch, tier) => {
    expect(pickTier({ ...base, ...patch })).toBe(tier);
  });
});

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
