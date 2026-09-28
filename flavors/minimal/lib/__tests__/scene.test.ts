import {
  glyphViews,
  LIVE_ROLLS,
  padSheets,
  pageGlyphs,
  rollView,
  tenureMonths,
} from "@/flavors/minimal/lib/scene/glyphs";
import {
  damp,
  REDUCED_MOTION_SPEEDUP,
  spring,
  step,
} from "@/flavors/minimal/lib/scene/poses";
import { describe, expect, it } from "vitest";

import { SCENE_BUDGET } from "@/lib/scene/budget";

describe("glyph pages", () => {
  it("keeps every page inside the shared view budget, lead included", () => {
    for (const [route, { views }] of Object.entries(pageGlyphs)) {
      expect(views.length + 1, route).toBeLessThanOrEqual(SCENE_BUDGET.views);
    }
  });

  it("gives every placeholder on a page its own id", () => {
    for (const { views } of Object.values(pageGlyphs)) {
      expect(new Set(views).size).toBe(views.length);
      for (const id of views) expect(glyphViews).toHaveProperty(id);
    }
  });

  it("lets the first changelog years roll live and the rest keep posters", () => {
    expect(rollView(0)).toBe("lead");
    expect(rollView(1)).toBe("roll-1");
    expect(rollView(2)).toBe("roll-2");
    expect(rollView(LIVE_ROLLS)).toBeNull();
    const rolls = pageGlyphs["/changelog"]?.views.filter((id) =>
      id.startsWith("roll")
    );
    expect(rolls).toHaveLength(LIVE_ROLLS - 1);
  });
});

describe("glyph data", () => {
  it("counts both ends of a role and never less than a month", () => {
    expect(tenureMonths(100, 100)).toBe(1);
    expect(tenureMonths(100, 111)).toBe(12);
    expect(tenureMonths(100, 90)).toBe(1);
  });

  it("thins the now pad as the page ages", () => {
    expect(padSheets(0)).toBe(8);
    expect(padSheets(Number.NaN)).toBe(8);
    expect(padSheets(20)).toBe(7);
    expect(padSheets(400)).toBe(2);
  });
});

describe("poses", () => {
  it("approaches the target and snaps once settled", () => {
    const half = damp(0, 1, Math.LN2, 1);
    expect(half).toBeCloseTo(0.5);
    expect(damp(0.9999, 1, 12, 1 / 60)).toBe(1);
  });

  it("reports motion until every key settles", () => {
    const pose = { a: 0, b: 1 };
    let frames = 0;
    while (step(pose, { a: 1, b: 1 }, 12, 1 / 60, true)) frames++;
    expect(pose.a).toBe(1);
    expect(frames).toBeGreaterThan(10);
    expect(frames).toBeLessThan(120);
  });

  it("settles faster with motion off, but still moves", () => {
    const count = (motion: boolean) => {
      const pose = { a: 0 };
      let frames = 0;
      while (step(pose, { a: 1 }, 12, 1 / 60, motion)) frames++;
      return frames;
    };
    expect(count(false)).toBeGreaterThan(1);
    expect(count(false) * (REDUCED_MOTION_SPEEDUP - 1)).toBeLessThan(
      count(true)
    );
  });

  it("rings a spring down to rest, whatever the frame length", () => {
    for (const dt of [1 / 120, 1 / 30]) {
      const state = { x: 1, v: 0 };
      let t = 0;
      while (spring(state, 300, 14, dt)) t += dt;
      expect(state).toEqual({ x: 0, v: 0 });
      expect(t).toBeLessThan(2);
    }
  });
});
