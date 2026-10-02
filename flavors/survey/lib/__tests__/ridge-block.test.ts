import { buildRelief } from "@/flavors/survey/lib/relief";
import {
  BLOCK_W,
  blockDepth,
  blockFrame,
  blockHeights,
  blockPoster,
  pitSpec,
  RIDGE_VIEW,
  ridgeSpec,
  tintIndex,
} from "@/flavors/survey/lib/ridge-block";
import { trialPoints } from "@/flavors/survey/lib/scene/poses";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));
const tallest = relief.summits.reduce((a, b) => (b.h > a.h ? b : a));

describe("ridge blocks", () => {
  it("cuts a role's ridge a third as deep as it is wide, peaking on the summit", () => {
    const spec = ridgeSpec(relief, tallest);
    expect(blockDepth(spec)).toBeCloseTo(BLOCK_W / 3);
    const heights = blockHeights(spec);
    expect(heights).toHaveLength((spec.nx + 1) * (spec.np + 1));
    const top = Math.max(...heights);
    expect(top).toBeCloseTo(tallest.h, 0);
    expect(tintIndex(spec, top)).toBe(7);
    expect(tintIndex(spec, 0)).toBe(0);
  });

  it("cuts a trial's pit round its stake, on the sheet", () => {
    const trial = trialPoints(relief)[0];
    if (!trial) throw new Error("no trial");
    const spec = pitSpec(relief, trial);
    expect(spec.stake).toEqual([trial.x, trial.p]);
    expect(spec.x0).toBeLessThanOrEqual(trial.x);
    expect(spec.x1).toBeGreaterThanOrEqual(trial.x);
    expect(spec.p0).toBeLessThan(trial.p);
    expect(spec.p1).toBeGreaterThan(trial.p);
    expect(blockDepth(spec)).toBeCloseTo((BLOCK_W * 9) / 16);
  });

  it("draws a poster inside its box, two skirts facing the eye", () => {
    const spec = ridgeSpec(relief, tallest);
    const poster = blockPoster(spec, {
      ...RIDGE_VIEW,
      ...blockFrame(spec, 160 / 88),
      w: 160,
      h: 88,
    });
    expect(poster.near).toHaveLength(2);
    expect(poster.far).toHaveLength(2);
    const numbers = [poster.top, poster.crest, ...poster.near]
      .join(" ")
      .match(/-?\d+(\.\d+)?/g)
      ?.map(Number);
    expect(numbers?.length).toBeGreaterThan(100);
    for (const n of numbers ?? []) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(160);
    }
  });
});
