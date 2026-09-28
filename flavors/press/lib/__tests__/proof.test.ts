import {
  controlStrip,
  plateFor,
  pressLog,
  printStatus,
  separate,
} from "@/flavors/press/lib/proof";
import { describe, expect, it } from "vitest";

import type { Experience, Project } from "@/lib/data/types";

const role = (company: string, startDate: string, endDate?: string) =>
  ({
    id: company,
    company,
    title: "Engineer",
    startDate,
    endDate,
  }) as Experience;

/** The real history, newest first. */
const roles = [
  role("Zunta", "2026-01-01"),
  role("Blai", "2025-09-01", "2026-05-01"),
  role("Proghit", "2024-09-01", "2026-01-01"),
  role("Lightwork", "2024-09-01", "2025-07-01"),
  role("FastLane", "2024-06-01", "2025-09-01"),
  role("MixR", "2024-07-01", "2025-02-01"),
];

describe("plates", () => {
  it("prints interface on P1 and systems on P2", () => {
    expect(plateFor("React Native")).toBe("p1");
    expect(plateFor("Next.js")).toBe("p1");
    expect(plateFor("Tailwind CSS")).toBe("p1");
    expect(plateFor("Node.js")).toBe("p2");
    expect(plateFor("TypeScript")).toBe("p2");
    expect(plateFor("Hono")).toBe("p2");
  });

  it("separates a stack without reordering it", () => {
    expect(separate(["Next.js", "TypeScript", "Tailwind", "Bun"])).toEqual({
      p1: ["Next.js", "Tailwind"],
      p2: ["TypeScript", "Bun"],
    });
  });
});

describe("printStatus", () => {
  it("stamps every project status", () => {
    expect(printStatus.maintained.label).toBe("In print");
    expect(printStatus.wip.stamp).toBe("dashed");
    expect(printStatus.archived.label).toBe("Out of print");
  });
});

describe("pressLog", () => {
  const log = pressLog(roles, new Date(2026, 8, 26));

  it("keeps the order and numbers runs from the oldest", () => {
    expect(log.runs.map((r) => r.role.company)).toEqual(
      roles.map((r) => r.company)
    );
    expect(log.runs.find((r) => r.role.company === "FastLane")?.run).toBe(1);
    expect(log.runs[0]?.run).toBe(6);
  });

  it("lays every run inside the axis and marks only the open one current", () => {
    for (const run of log.runs) {
      expect(run.start).toBeGreaterThanOrEqual(0);
      expect(run.start + run.length).toBeLessThanOrEqual(1 + 1e-9);
    }
    expect(
      log.runs.filter((r) => r.current).map((r) => r.role.company)
    ).toEqual(["Zunta"]);
    const [newest] = log.runs;
    expect((newest?.start ?? 0) + (newest?.length ?? 0)).toBeCloseTo(1);
  });

  it("ticks each new year and finds the peak", () => {
    expect(log.years.map((y) => y.year)).toEqual([2025, 2026]);
    expect(log.peak).toBe(4);
  });

  it("is empty without roles", () => {
    expect(pressLog([], new Date())).toEqual({ runs: [], years: [], peak: 0 });
  });
});

describe("controlStrip", () => {
  it("has one patch per project, solid when featured", () => {
    const projects = [
      { slug: "a", name: "A", featured: true, stack: ["React"] },
      { slug: "b", name: "B", featured: false, stack: [] },
    ] as unknown as Project[];
    expect(controlStrip(projects)).toEqual([
      { slug: "a", name: "A", solid: true, plate: "p1" },
      { slug: "b", name: "B", solid: false, plate: "p2" },
    ]);
  });
});
