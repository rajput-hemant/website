import {
  defaultPrefs,
  fonts,
  migratePrefs,
  PREFS_VERSION,
  scenes,
  textures,
  themes,
} from "@/flavors/minimal/lib/prefs";
import { describe, expect, it } from "vitest";

describe("defaultPrefs", () => {
  it("starts with every switch on and no texture", () => {
    expect(defaultPrefs).toMatchObject({
      smoothScroll: true,
      cursor: true,
      sound: true,
      haptics: true,
      texture: "none",
      motion: true,
      scene: "auto",
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
      smoothScroll: false,
      cursor: false,
      sound: false,
    };
    expect(migratePrefs(v1)).toEqual({
      ...defaultPrefs,
      theme: "light",
      accentHue: 160,
      font: "serif",
      motion: false,
      sound: false,
    });
  });

  it("keeps every choice stored under the current version", () => {
    const current = {
      ...defaultPrefs,
      texture: "dots",
      smoothScroll: false,
      cursor: false,
      sound: false,
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

  it("falls back to the default for an unknown or retired enum value", () => {
    expect(migratePrefs({ version: PREFS_VERSION, theme: "sepia" })).toEqual(
      defaultPrefs
    );
    expect(
      migratePrefs({ version: PREFS_VERSION, font: "comic-sans" })
    ).toEqual(defaultPrefs);
    expect(
      migratePrefs({ version: PREFS_VERSION, texture: "confetti" })
    ).toEqual(defaultPrefs);
    expect(migratePrefs({ version: PREFS_VERSION, scene: "ultra" })).toEqual(
      defaultPrefs
    );
  });

  it("accepts every real font, theme, texture and scene level, including mono", () => {
    for (const font of fonts) {
      expect(migratePrefs({ version: PREFS_VERSION, font }).font).toBe(font);
    }
    for (const theme of themes) {
      expect(migratePrefs({ version: PREFS_VERSION, theme }).theme).toBe(theme);
    }
    for (const texture of textures) {
      expect(migratePrefs({ version: PREFS_VERSION, texture }).texture).toBe(
        texture
      );
    }
    for (const scene of scenes) {
      expect(migratePrefs({ version: PREFS_VERSION, scene }).scene).toBe(scene);
    }
  });
});

describe("haptics preference", () => {
  it("defaults on and fills in for stored prefs from before the key", () => {
    expect(defaultPrefs.haptics).toBe(true);
    const { haptics: _added, ...older } = defaultPrefs;
    expect(migratePrefs({ ...older, sound: false })).toEqual({
      ...defaultPrefs,
      sound: false,
    });
    expect(migratePrefs({ ...defaultPrefs, haptics: false }).haptics).toBe(
      false
    );
  });
});
