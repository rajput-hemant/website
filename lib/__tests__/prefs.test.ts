// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";

import {
  accentPresets,
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_VERSION,
  prefsScript,
} from "@/lib/prefs";

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("dark"),
  })) as unknown as typeof window.matchMedia;
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

  it("keeps only theme and accent from an older version", () => {
    const old = {
      version: 2,
      theme: "light",
      accentHue: 160,
      font: "serif",
      motion: false,
      sound: true,
    };
    expect(migratePrefs(old)).toEqual({
      ...defaultPrefs,
      theme: "light",
      accentHue: 160,
    });
  });

  it("keeps every valid choice from the current version", () => {
    const current = {
      ...defaultPrefs,
      theme: "dark",
      motion: false,
      scene: "low",
      sound: true,
    };
    expect(migratePrefs(current)).toEqual(current);
  });

  it("drops malformed values instead of passing them through", () => {
    const bad = {
      version: PREFS_VERSION,
      theme: "sepia",
      scene: 3,
      motion: "yes",
      accentHue: "blue",
      extra: 1,
    };
    expect(migratePrefs(bad)).toEqual(defaultPrefs);
  });
});

describe("applyPrefs", () => {
  it("mirrors preferences onto the root element", () => {
    const root = document.createElement("html");
    applyPrefs(
      { ...defaultPrefs, theme: "dark", accentHue: 395, scene: "off" },
      root,
      accentPresets
    );
    expect(root.dataset).toMatchObject({
      theme: "dark",
      scene: "off",
      cursor: "on",
      sound: "off",
      accent: "custom",
    });
    expect(root.style.getPropertyValue("--accent-hue")).toBe("35");
  });

  it("names a preset accent", () => {
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root, accentPresets);
    expect(root.dataset.accent).toBe("brass");
  });
});

describe("prefsScript", () => {
  it("runs standalone and applies stored preferences", () => {
    window.localStorage.setItem(
      "hr.prefs",
      JSON.stringify({ ...defaultPrefs, theme: "dark" })
    );
    new Function(prefsScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
