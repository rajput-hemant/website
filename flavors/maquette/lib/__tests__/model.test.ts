import {
  encodeBoard,
  footprint,
  parseBoard,
  phaseBoard,
  phaseDates,
  phasingPlan,
  pieces,
  SITE_D,
  SITE_W,
  sitePlan,
  type Block,
} from "@/flavors/maquette/lib/model";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import { orderProjectsForCatalog } from "@/lib/data/project-order";

const today = new Date(2026, 8, 26);
const all = pieces(orderProjectsForCatalog(projects), today);

const apart = (a: Block, b: Block) =>
  a.i + a.cols + 1 <= b.i ||
  b.i + b.cols + 1 <= a.i ||
  a.j + a.rows + 1 <= b.j ||
  b.j + b.rows + 1 <= a.j;

describe("pieces", () => {
  it("cuts each project to the rule: storeys by age, bays by stack", () => {
    const bySlug = new Map(all.map((p) => [p.project.name, p]));
    expect(bySlug.get("Infinitunes")).toMatchObject({
      storeys: 4,
      bays: 8,
      cols: 4,
      rows: 2,
    });
    expect(bySlug.get("JioSaavn API")).toMatchObject({ storeys: 3, bays: 3 });
    expect(bySlug.get("Lipi")?.finish.material).toBe("wood");
    expect(bySlug.get("JioSaavn API")?.finish.material).toBe("grey");
    expect(bySlug.get("leetcode")).toMatchObject({ cols: 5, rows: 1 });
  });

  it("lays bays out in one row up to five, then two", () => {
    expect(footprint(0)).toEqual({ cols: 1, rows: 1 });
    expect(footprint(5)).toEqual({ cols: 5, rows: 1 });
    expect(footprint(7)).toEqual({ cols: 4, rows: 2 });
  });
});

describe("sitePlan", () => {
  for (const allFinished of [false, true]) {
    it(`places every piece on the site, a bay apart (allFinished ${allFinished})`, () => {
      const { blocks } = sitePlan(all, { allFinished });
      expect(blocks).toHaveLength(all.length);
      for (const b of blocks) {
        expect(b.i + b.cols).toBeLessThanOrEqual(SITE_W);
        expect(b.j + b.rows).toBeLessThanOrEqual(SITE_D);
      }
      blocks.forEach((a, x) =>
        blocks.slice(x + 1).forEach((b) => expect(apart(a, b)).toBe(true))
      );
    });
  }

  it("keeps only the featured pieces in material on the home model", () => {
    const { blocks } = sitePlan(all);
    const inMaterial = blocks.filter((b) => b.material !== "foam");
    expect(inMaterial).toHaveLength(all.filter((p) => p.featured).length);
    expect(
      blocks.filter((b) => b.material === "foam").every((b) => b.storeys === 1)
    ).toBe(true);
  });
});

describe("board encoding", () => {
  it("round-trips a board", () => {
    const board = sitePlan(all, { focus: "lipi" });
    expect(parseBoard(encodeBoard(board))).toEqual(board);
  });

  it("drops malformed entries", () => {
    expect(parseBoard("x|a,1,1,1,z,0,0;b,2,1,3,c,1,1").blocks).toEqual([
      { id: "b", cols: 2, rows: 1, storeys: 3, material: "card", i: 1, j: 1 },
    ]);
    expect(parseBoard(null)).toEqual({ blocks: [], focus: null });
  });
});

describe("phasingPlan", () => {
  const plan = phasingPlan(experience, today);

  it("puts every role on one axis from the first start to now", () => {
    expect(plan.phases).toHaveLength(experience.length);
    for (const p of plan.phases) {
      expect(p.start).toBeGreaterThanOrEqual(0);
      expect(p.start + p.span).toBeLessThanOrEqual(1.0001);
    }
    expect(plan.ticks[0]?.label).toBe(plan.from);
    expect(plan.ticks.at(-1)?.label).toBe("Now");
    expect(plan.phases.filter((p) => p.current)).toHaveLength(
      experience.filter((r) => !r.endDate).length
    );
  });

  it("numbers phases from the oldest", () => {
    const oldest = plan.phases.find((p) => p.n === 1);
    const starts = experience.map((r) => r.startDate).sort();
    expect(oldest?.role.startDate).toBe(starts[0]);
  });

  it("prints dates as year-month", () => {
    const role = experience[0];
    if (role)
      expect(phaseDates(role)).toMatch(/^\d{4}-\d{2} to (now|\d{4}-\d{2})$/);
  });

  it("builds the phasing model inside the site", () => {
    const { blocks } = phaseBoard(plan);
    expect(blocks).toHaveLength(experience.length);
    for (const b of blocks) {
      expect(b.i + b.cols).toBeLessThanOrEqual(SITE_W);
      expect(b.j).toBeLessThan(SITE_D);
    }
    expect(new Set(blocks.map((b) => b.j)).size).toBe(blocks.length);
  });
});
