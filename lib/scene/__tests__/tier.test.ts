import { describe, expect, it } from "vitest";

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
