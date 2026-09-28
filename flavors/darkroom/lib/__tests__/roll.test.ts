import {
  contactSheet,
  development,
  edgeCodes,
  filmRoll,
  rollStrip,
} from "@/flavors/darkroom/lib/roll";
import { describe, expect, it } from "vitest";

import type { Experience, Project } from "@/lib/data/types";

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

describe("contact sheet", () => {
  it("numbers frames from 1 and marks the featured ones as selects", () => {
    const frames = contactSheet([
      project({ slug: "a", featured: true }),
      project({ slug: "b" }),
    ]);
    expect(frames.map((f) => [f.n, f.select])).toEqual([
      [1, true],
      [2, false],
    ]);
  });

  it("gives each project a stable picture", () => {
    const [a] = contactSheet([
      project({ slug: "x", tagline: "A music player" }),
    ]);
    const [b] = contactSheet([
      project({ slug: "x", tagline: "A music player" }),
    ]);
    expect(a?.archetype).toBe("music");
    expect(a?.seed).toBe(b?.seed);
  });

  it("prints the last frame's half code as End", () => {
    expect(edgeCodes(11, false)).toEqual({ arrow: "▸11", half: "11A" });
    expect(edgeCodes(14, true).half).toBe("End");
  });

  it("has a darkroom word for every status", () => {
    expect(development.maintained.word).toBe("Fixed");
    expect(development.wip.word).toBe("Developing");
    expect(development.archived.word).toBe("Sleeved");
  });
});

describe("roll strip", () => {
  it("marks the first frame, the first role and the current one from the data", () => {
    const strip = rollStrip(
      [project({ year: 2022 }), project({ year: null })],
      [
        role({ company: "Zunta", startDate: "2026-01-01" }),
        role({
          company: "MixR",
          startDate: "2024-07-01",
          endDate: "2025-02-01",
        }),
      ],
      new Date(2026, 8, 27)
    );
    expect(strip.marks).toEqual([
      { year: 2022, text: "first frame" },
      { year: 2024, text: "first role" },
      { year: 2026, text: "Zunta" },
    ]);
    expect(strip).toMatchObject({ years: 4, roles: 2, frames: 2 });
  });
});

describe("film roll", () => {
  it("keeps the data's order but numbers frames from the oldest role", () => {
    const frames = filmRoll(
      [
        role({ company: "New", startDate: "2026-01-01" }),
        role({
          company: "Old",
          startDate: "2024-06-01",
          endDate: "2025-09-01",
        }),
      ],
      new Date(2026, 8, 27)
    );
    expect(frames.map((f) => [f.role.company, f.n, f.code])).toEqual([
      ["New", 2, "26·01"],
      ["Old", 1, "24·06"],
    ]);
    expect(frames[0]?.current).toBe(true);
    expect(frames[1]?.months).toBe(16);
  });
});
