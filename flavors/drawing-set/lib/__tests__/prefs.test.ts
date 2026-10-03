// @vitest-environment jsdom
import {
  accentPresets,
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_VERSION,
} from "@/flavors/drawing-set/lib/prefs";
import { prefsScript } from "@/flavors/drawing-set/lib/prefs-script";
import { beforeAll, describe, expect, it } from "vitest";

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
      sound: "on",
      accent: "custom",
    });
    expect(root.style.getPropertyValue("--accent-hue")).toBe("35");
  });

  it("names a preset accent", () => {
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root, accentPresets);
    expect(root.dataset.accent).toBe("redline");
  });
});

describe("prefsScript", () => {
  it("runs standalone and applies stored preferences", () => {
    window.localStorage.setItem(
      "hr.prefs",
      JSON.stringify({ ...defaultPrefs, theme: "dark" })
    );
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- the test must run the exact inline script string the page ships
    new Function(prefsScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");
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
    expect(migratePrefs({ ...defaultPrefs, haptics: "no" }).haptics).toBe(true);
  });

  it("mirrors onto data-haptics", () => {
    const root = document.documentElement;
    applyPrefs({ ...defaultPrefs, haptics: false }, root, accentPresets);
    expect(root.dataset.haptics).toBe("off");
    applyPrefs(defaultPrefs, root, accentPresets);
    expect(root.dataset.haptics).toBe("on");
  });
});
