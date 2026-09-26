import {
  buildRelief,
  contour,
  gridRef,
  heightAt,
  levels,
  readout,
  screenY,
  SHEET,
} from "@/flavors/survey/lib/relief";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

const today = new Date(2026, 8, 20);
const relief = buildRelief(experience, projects, today);

describe("buildRelief", () => {
  it("spans the first surveyed year to the end of this one", () => {
    expect(relief.from).toBe(2022);
    expect(relief.to).toBe(2027);
    expect(relief.coast).toBeGreaterThan(SHEET.X0);
    expect(relief.coast).toBeLessThan(SHEET.X1);
  });

  it("makes each hill as high as its months in the role", () => {
    const h = Object.fromEntries(relief.summits.map((s) => [s.id, s.h]));
    expect(h).toMatchObject({ proghit: 16, fastlane: 15, zunta: 8, mixr: 7 });
    expect(relief.summits.find((s) => s.id === "zunta")?.current).toBe(true);
  });

  it("keeps every summit north of the boundary and every site south of it", () => {
    for (const s of relief.summits) expect(s.p).toBeLessThan(SHEET.BOUNDARY);
    for (const s of relief.sites) expect(s.p).toBeGreaterThan(SHEET.BOUNDARY);
    expect(relief.sites).toHaveLength(projects.length);
  });

  it("finds the massif: four roles at once", () => {
    expect(relief.peak.count).toBe(4);
  });

  it("keeps summit labels apart", () => {
    const boxes = relief.summits.map((s) => ({
      id: s.id,
      x0: s.x - s.company.length * 5,
      x1: s.x + s.company.length * 5,
      y: screenY(s.p, s.h),
    }));
    for (const a of boxes) {
      for (const b of boxes) {
        if (a === b) continue;
        const overlapX = a.x0 < b.x1 && b.x0 < a.x1;
        if (overlapX) expect(Math.abs(a.y - b.y)).toBeGreaterThan(12);
      }
    }
  });
});

describe("the ground", () => {
  it("peaks at each summit", () => {
    for (const s of relief.summits) {
      expect(heightAt(relief.summits, s.x, s.p)).toBeCloseTo(s.h, 0);
    }
  });

  it("traces closed contours for every level", () => {
    for (const level of levels(relief)) {
      const rings = contour(relief.summits, level);
      expect(rings.length).toBeGreaterThan(0);
      expect(rings.every((ring) => ring.closed)).toBe(true);
    }
  });
});

describe("readout", () => {
  it("names the month, the grid square and the roles running", () => {
    const x = SHEET.X0 + (2024 + 10 / 12 - 2022) * relief.yearW;
    expect(gridRef(relief, x, 100)).toBe("24 07");
    expect(readout(relief, x, 100)).toEqual({
      where: "NOV 2024 · GRID 24 07",
      what: "4 roles running",
    });
  });

  it("says the sea is unsurveyed", () => {
    expect(readout(relief, SHEET.X1 - 1, 100).what).toBe("Not yet surveyed");
  });
});
