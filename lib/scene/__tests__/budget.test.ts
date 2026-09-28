import { describe, expect, it } from "vitest";

import { frameStats, overBudget, recordFrame, SCENE_BUDGET } from "../budget";

describe("scene budgets", () => {
  it("caps a page at 4 live views and under 60 draw calls", () => {
    expect(SCENE_BUDGET).toEqual({ views: 4, drawCalls: 60 });
    expect(overBudget({ views: 4, calls: 59 })).toEqual([]);
    expect(overBudget({ views: 5, calls: 60 })).toEqual(["views", "drawCalls"]);
  });

  it("records the last frame's totals and counts frames", () => {
    const before = frameStats.frames;
    expect(recordFrame({ calls: 12, triangles: 3400 }, 2)).toEqual([]);
    expect(frameStats).toMatchObject({ calls: 12, triangles: 3400, views: 2 });
    expect(frameStats.frames).toBe(before + 1);
    expect(recordFrame({ calls: 61, triangles: 0 }, 1)).toEqual(["drawCalls"]);
  });
});
