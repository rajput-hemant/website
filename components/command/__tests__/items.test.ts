import { describe, expect, it } from "vitest";

import { buildActions, filter, keywordsFor, type Item } from "../items";

const project: Item = {
  id: "project:jiosaavn-api",
  title: "JioSaavn API",
  subtitle: "An unofficial TypeScript wrapper",
  group: "Projects",
  href: "/projects#jiosaavn-api",
  keywords: ["Hono", "Bun"],
};
const score = (item: Item, search: string) =>
  filter(item.id, search, keywordsFor(item));

describe("filter", () => {
  it("scores title matches fuzzily, word starts and acronyms included", () => {
    expect(score(project, "jiosaavn")).toBeGreaterThan(0.8);
    expect(score(project, "api")).toBeGreaterThan(0.8);
    expect(score(project, "jsa")).toBeGreaterThan(0);
  });

  it("matches subtitles, groups and keywords only verbatim, below good title hits", () => {
    expect(score(project, "hono")).toBe(0.4);
    expect(score(project, "typescript wrapper")).toBe(0.4);
    expect(score(project, "projects")).toBe(0.4);
    expect(score(project, "hno")).toBe(0);
    expect(score(project, "hono rust")).toBe(0);
  });

  it("drops letters scattered across a long title", () => {
    const update: Item = {
      id: "update:1",
      title: "Rebuilt this site from scratch: static pages and a small lab",
      group: "Changelog",
      href: "/changelog#2026",
      keywords: [],
    };
    expect(score(update, "rust")).toBe(0);
    expect(score(update, "static")).toBeGreaterThan(0.8);
  });
});

describe("buildActions", () => {
  it("adds copy email only with an email, and markdown only for mirrored pages", () => {
    expect(buildActions({}).map((a) => a.action)).toEqual([
      "theme",
      "customize",
    ]);
    expect(
      buildActions({ email: "a@b.c", markdownPath: "/work.md" }).map(
        (a) => a.action
      )
    ).toEqual(["copy-email", "theme", "customize", "markdown"]);
  });
});
