import {
  arcPath,
  assembly,
  bezelPrints,
  HZ,
  jewelling,
  jewels,
  legend,
  ring,
  roman,
  serviceRecord,
  span,
  spell,
  stackCounts,
  technicalSheet,
  VPH,
} from "@/flavors/calibre/lib/movement";
import { describe, expect, it } from "vitest";

import type { Experience, Project, SkillGroup } from "@/lib/data/types";

const project = (patch: Partial<Project>): Project => ({
  id: patch.slug ?? "p",
  slug: "p",
  name: "P",
  tagline: "",
  description: [],
  stack: [],
  featured: false,
  status: "maintained",
  year: 2023,
  ...patch,
});

const role = (patch: Partial<Experience>): Experience => ({
  id: patch.company ?? "r",
  company: "R",
  title: "Engineer",
  location: "Remote",
  remote: true,
  employmentType: "full-time",
  startDate: "2024-01-01",
  body: [],
  highlights: [],
  ...patch,
});

const group = (title: string): SkillGroup => ({ id: title, title, items: [] });

describe("rate", () => {
  it("beats one hertz per stack, two beats per oscillation", () => {
    expect(HZ).toBe(3);
    expect(VPH).toBe(21_600);
  });
});

describe("jewels", () => {
  it("numbers every project from 1 and counts them from the data, not a fixed 14", () => {
    const list = jewels([
      project({ slug: "a", featured: true }),
      project({ slug: "b" }),
      project({ slug: "c" }),
    ]);
    expect(list.map((j) => `${j.n} of ${j.of}`)).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
    expect(list.map((j) => j.inView)).toEqual([true, false, false]);
  });

  it("sets two jewels on the pallet fork and the rest in chatons", () => {
    expect(jewelling(14)).toEqual({ chatons: 12, pallet: 2 });
    expect(jewelling(9)).toEqual({ chatons: 7, pallet: 2 });
    expect(jewelling(1)).toEqual({ chatons: 0, pallet: 1 });
  });

  it("puts the first map position at twelve o'clock, clockwise", () => {
    const [top, right] = ring(4, 10);
    expect(top?.x).toBeCloseTo(0);
    expect(top?.y).toBeCloseTo(-10);
    expect(right?.x).toBeCloseTo(10);
    expect(right?.y).toBeCloseTo(0);
  });

  it("lists only the states in use, service first", () => {
    expect(
      legend([
        project({ status: "archived" }),
        project({ status: "maintained" }),
      ])
    ).toEqual(["maintained", "archived"]);
  });
});

describe("technical sheet", () => {
  it("counts jewels, those in view and one complication per skill group", () => {
    const sheet = technicalSheet(
      [project({ featured: true }), project({}), project({})],
      [group("Languages"), group("Frontend")],
      []
    );
    expect(sheet).toMatchObject({
      jewels: 3,
      inView: 1,
      complications: 2,
      groups: ["Languages", "Frontend"],
    });
  });
});

describe("stacks behind the frequency", () => {
  it("counts the projects shipping on each stack from their stack names", () => {
    expect(
      stackCounts([
        project({ stack: ["Next.js", "Tailwind CSS"] }),
        project({ stack: ["TypeScript", "Hono", "Bun"] }),
        project({ stack: ["Flutter", "Dart"] }),
        project({ stack: ["Rust", "Go"] }),
      ])
    ).toEqual([
      { stack: "web", jewels: 1 },
      { stack: "server", jewels: 1 },
      { stack: "mobile", jewels: 1 },
    ]);
  });
});

describe("assembly", () => {
  it("names the countries remote roles were based in, newest first", () => {
    expect(
      assembly([
        role({ location: "London, UK", startDate: "2024-01-01" }),
        role({ location: "Boston, MA, USA", startDate: "2025-01-01" }),
        role({ location: "New York, NY, USA", startDate: "2023-01-01" }),
      ])
    ).toBe("Remote, for teams in USA and UK");
  });

  it("reads on site with no remote role, and nothing with no roles", () => {
    expect(assembly([role({ remote: false })])).toBe("On site");
    expect(assembly([])).toBeUndefined();
  });
});

describe("service record", () => {
  const today = new Date("2026-09-27T12:00:00Z");

  it("spans whole years back from this month, long enough for the oldest role", () => {
    const record = serviceRecord(
      [role({ startDate: "2024-06-01", endDate: "2025-09-01" })],
      today
    );
    expect(record.months).toBe(36);
    expect(record.years.map((y) => y.year)).toEqual([2024, 2025, 2026]);
  });

  it("puts the newest role outermost and runs a current role to the rim", () => {
    const record = serviceRecord(
      [
        role({
          company: "Old",
          startDate: "2024-07-01",
          endDate: "2025-02-01",
        }),
        role({ company: "Now", startDate: "2026-01-01" }),
      ],
      today
    );
    expect(record.arcs.map((a) => a.role.company)).toEqual(["Now", "Old"]);
    const [now, old] = record.arcs;
    expect(now?.current).toBe(true);
    expect(now?.to).toBe(1);
    expect(old?.from).toBeLessThan(old?.to ?? 0);
  });

  it("prints spans the way the dial does", () => {
    expect(span(role({ startDate: "2026-01-01" }))).toBe("2026 to now");
    expect(span(role({ startDate: "2024-09-01", endDate: "2026-01-01" }))).toBe(
      "2024 to 26"
    );
  });

  it("draws an arc that starts at twelve", () => {
    expect(arcPath(0, 0, 10, 0, 0.25)).toBe(
      "M0.00 -10.00A10 10 0 0 1 10.00 0.00"
    );
  });
});

describe("roman hours", () => {
  it("reads 0 and 12 as XII", () => {
    expect([0, 3, 6, 9, 12].map(roman)).toEqual([
      "XII",
      "III",
      "VI",
      "IX",
      "XII",
    ]);
  });
});

describe("spelled counts", () => {
  it("spells the jewel count the way the bezel prints it", () => {
    expect([9, 14, 20, 21, 100].map(spell)).toEqual([
      "nine",
      "fourteen",
      "twenty",
      "twenty-one",
      "100",
    ]);
  });
});

describe("bezel prints", () => {
  it("prints the real jewel count, in words", () => {
    expect(bezelPrints(9, "Mathura, India", "AL")).toEqual([
      "Calibre AL-26",
      "nine jewels",
      "21,600 vph",
      "Mathura",
    ]);
  });
});
