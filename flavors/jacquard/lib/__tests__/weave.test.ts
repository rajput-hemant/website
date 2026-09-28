import {
  accessions,
  buildDraft,
  byYear,
  endFor,
  kindFor,
  loomThreads,
  pickFor,
  twill,
} from "@/flavors/jacquard/lib/weave";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import type { Project } from "@/lib/data/types";

const project = (
  slug: string,
  year: number | null,
  stack: string[]
): Project => ({
  id: slug,
  slug,
  name: slug,
  tagline: "",
  description: [],
  stack,
  featured: false,
  status: "maintained",
  year,
});

describe("kindFor", () => {
  it("threads each technology on its shaft", () => {
    expect(kindFor("TypeScript")).toBe("lang");
    expect(kindFor("Go")).toBe("lang");
    expect(kindFor("Next.js")).toBe("ui");
    expect(kindFor("shadcn/ui")).toBe("ui");
    expect(kindFor("NextAuth.js")).toBe("data");
    expect(kindFor("Supabase")).toBe("data");
    expect(kindFor("React Three Fiber")).toBe("three");
    expect(kindFor("Three.js")).toBe("three");
    expect(kindFor("React")).toBe("ui");
    expect(kindFor("GitHub Actions")).toBe("run");
    expect(kindFor("Hono")).toBe("run");
  });
});

describe("buildDraft", () => {
  const draft = buildDraft(projects);

  it("is 29 ends by 9 picks on the real content", () => {
    expect(draft.ends).toHaveLength(29);
    expect(draft.picks).toHaveLength(9);
    expect(draft.omitted).toBe(0);
    expect(draft.years).toEqual({ from: 2022, to: 2025 });
  });

  it("orders picks by year, keeping the catalogue order within a year", () => {
    expect(draft.picks.map((p) => p.project.slug).slice(0, 4)).toEqual([
      "infinitunes",
      "leetcode",
      "calculator",
      "jiosaavn-api",
    ]);
    expect(draft.picks.at(-1)?.project.slug).toBe("shellai");
  });

  it("threads ends in the order they first appear", () => {
    expect(draft.ends.slice(0, 3).map((e) => e.tech)).toEqual([
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
    ]);
    expect(endFor(draft, "llms")?.index).toBe(28);
  });

  it("raises exactly the ends in each stack", () => {
    const jio = pickFor(draft, "jiosaavn-api");
    expect(jio?.ends.map((e) => draft.ends[e]?.tech)).toEqual([
      "TypeScript",
      "Hono",
      "Bun",
    ]);
    const row = jio ? draft.raised[jio.index] : undefined;
    expect(row?.filter(Boolean)).toHaveLength(3);
  });

  it("leaves projects without a stack out of the draft", () => {
    const d = buildDraft([project("a", 2024, []), project("b", 2024, ["Go"])]);
    expect(d.picks).toHaveLength(1);
    expect(d.omitted).toBe(1);
  });

  it("dedupes ends case-insensitively", () => {
    const d = buildDraft([
      project("a", 2024, ["React", "react "]),
      project("b", 2025, ["REACT"]),
    ]);
    expect(d.ends).toHaveLength(1);
    expect(d.picks.map((p) => p.ends)).toEqual([[0], [0]]);
  });
});

describe("byYear", () => {
  it("puts projects without a year last", () => {
    const list = [project("a", null, []), project("b", 2020, [])];
    expect(byYear(list).map((p) => p.slug)).toEqual(["b", "a"]);
  });
});

describe("accessions", () => {
  it("numbers each year's intake from 1", () => {
    const numbers = accessions(projects, "HR");
    expect(numbers.get("infinitunes")).toBe("HR 2022.1");
    expect(numbers.get("leetcode")).toBe("HR 2022.2");
    expect(numbers.get("lipi")).toBe("HR 2023.2");
    expect(numbers.get("shellai")).toBe("HR 2025.1");
  });
});

describe("twill", () => {
  it("steps the pick one end per row", () => {
    const draft = buildDraft(projects);
    const cells = twill(draft, pickFor(draft, "jiosaavn-api"));
    expect(cells).toHaveLength(29);
    expect(cells[0]?.[1]).toBe(1);
    expect(cells[1]?.[0]).toBe(1);
    expect(cells[0]?.[0]).toBe(-1);
    const raised = cells.flat().filter((cell) => cell >= 0);
    expect(raised).toHaveLength(3 * 29);
  });
});

describe("loomThreads", () => {
  const loom = loomThreads(experience, new Date(2026, 8, 27));

  it("carries a thread on when the team moved: 6 roles, 4 threads", () => {
    expect(loom.rows).toHaveLength(6);
    expect(loom.threads).toBe(4);
    const thread = (id: string) =>
      loom.rows.find((r) => r.role.id === id)?.thread;
    expect(thread("fastlane")).toBe(thread("blai"));
    expect(thread("proghit")).toBe(thread("zunta"));
    expect(thread("mixr")).not.toBe(thread("lightwork"));
    expect(loom.carries).toHaveLength(2);
  });

  it("numbers threads by when they start", () => {
    const yarn = (id: string) => loom.rows.find((r) => r.role.id === id)?.yarn;
    expect(yarn("fastlane")).toBe("lang");
    expect(yarn("mixr")).toBe("run");
    expect(yarn("lightwork")).toBe("data");
    expect(yarn("zunta")).toBe("ui");
  });

  it("lays every role inside the axis and ticks each new year", () => {
    for (const row of loom.rows) {
      expect(row.start).toBeGreaterThanOrEqual(0);
      expect(row.start + row.length).toBeLessThanOrEqual(1 + 1e-9);
    }
    expect(loom.from).toBe("2024-06");
    expect(loom.years.map((y) => y.year)).toEqual([2025, 2026]);
    expect(loom.rows.filter((r) => r.current).map((r) => r.role.id)).toEqual([
      "zunta",
    ]);
  });

  it("is empty without roles", () => {
    expect(loomThreads([], new Date()).rows).toEqual([]);
  });
});
