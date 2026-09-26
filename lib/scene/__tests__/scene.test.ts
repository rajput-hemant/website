import { describe, expect, it } from "vitest";

import { toLinear } from "@/lib/scene/accent";
import { pickTier, type TierSignals } from "@/lib/scene/tier";

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
