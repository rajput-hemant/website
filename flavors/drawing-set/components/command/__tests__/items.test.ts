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
      href: "/now#log-2026",
      keywords: [],
    };
    expect(score(update, "rust")).toBe(0);
    expect(score(update, "static")).toBeGreaterThan(0.8);
  });
});

describe("buildActions", () => {
  const base = {
    theme: "dark",
    motion: true,
    sound: false,
    scene: "auto",
  } as const;

  it("adds copy email only when the index carries an address", () => {
    expect(buildActions(base).map((a) => a.action)).toEqual([
      "resume",
      "toggle-theme",
      "toggle-motion",
      "toggle-sound",
      "scene-auto",
      "scene-low",
      "scene-off",
    ]);
    expect(
      buildActions({ ...base, email: "a@b.c" }).map((a) => a.action)
    ).toEqual([
      "copy-email",
      "resume",
      "toggle-theme",
      "toggle-motion",
      "toggle-sound",
      "scene-auto",
      "scene-low",
      "scene-off",
    ]);
  });

  it("marks the scene action matching the current preference as active", () => {
    const actions = buildActions({ ...base, scene: "low" });
    const byAction = new Map(actions.map((a) => [a.action, a.active]));
    expect(byAction.get("scene-auto")).toBeFalsy();
    expect(byAction.get("scene-low")).toBe(true);
    expect(byAction.get("scene-off")).toBeFalsy();
  });

  it("phrases the theme toggle after the resolved theme", () => {
    const [, dark] = buildActions({ ...base, theme: "dark" });
    const [, light] = buildActions({ ...base, theme: "light" });
    expect(dark?.title).toBe("Switch to light theme");
    expect(light?.title).toBe("Switch to dark theme");
  });
});
