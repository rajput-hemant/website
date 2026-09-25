import { describe, expect, it } from "vitest";

import { defaultPrefs, migratePrefs, PREFS_VERSION } from "@/lib/prefs";

describe("defaultPrefs", () => {
  it("starts calm: effects off, link previews and motion on", () => {
    expect(defaultPrefs).toMatchObject({
      smoothScroll: false,
      cursor: false,
      sound: false,
      texture: "none",
      motion: true,
      linkPreviews: true,
      version: PREFS_VERSION,
    });
    expect(defaultPrefs).not.toHaveProperty("radius");
  });
});

describe("migratePrefs", () => {
  it.each([
    ["null", null],
    ["a string", "dark"],
    ["a number", 42],
    ["an array", ["dark"]],
  ])("returns the defaults for %s", (_label, stored) => {
    expect(migratePrefs(stored)).toEqual(defaultPrefs);
  });

  it("resets version 1 effects to the new defaults and keeps real choices", () => {
    const v1 = {
      theme: "light",
      accentHue: 160,
      font: "serif",
      radius: 12,
      texture: "grid",
      motion: false,
      smoothScroll: true,
      cursor: true,
      sound: true,
    };
    expect(migratePrefs(v1)).toEqual({
      ...defaultPrefs,
      theme: "light",
      accentHue: 160,
      font: "serif",
      motion: false,
      sound: true,
    });
  });

  it("keeps every choice stored under the current version", () => {
    const current = {
      ...defaultPrefs,
      texture: "dots",
      smoothScroll: true,
      cursor: true,
      linkPreviews: false,
    };
    expect(migratePrefs(current)).toEqual(current);
  });

  it("drops unknown and retired keys", () => {
    const migrated = migratePrefs({
      version: PREFS_VERSION,
      radius: 4,
      extra: 1,
    });
    expect(migrated).toEqual(defaultPrefs);
    expect(Object.keys(migrated).sort()).toEqual(
      Object.keys(defaultPrefs).sort()
    );
  });

  it("stamps the current version", () => {
    expect(migratePrefs({ version: 1 }).version).toBe(PREFS_VERSION);
  });
});
