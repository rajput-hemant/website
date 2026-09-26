// @vitest-environment jsdom
import {
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
  PREFS_VERSION,
  prefsScript,
} from "@/flavors/timetable/lib/prefs";
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

  it("keeps only the theme from an older version", () => {
    const old = { version: 0, theme: "light", motion: false, sound: true };
    expect(migratePrefs(old)).toEqual({ ...defaultPrefs, theme: "light" });
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

  it("drops malformed values and unknown keys", () => {
    const bad = {
      version: PREFS_VERSION,
      theme: "sepia",
      scene: 3,
      motion: "yes",
      accentHue: 30,
    };
    expect(migratePrefs(bad)).toEqual(defaultPrefs);
  });
});

describe("applyPrefs", () => {
  it("mirrors preferences onto the root element", () => {
    const root = document.createElement("html");
    applyPrefs({ ...defaultPrefs, theme: "dark", scene: "off" }, root);
    expect(root.dataset).toMatchObject({
      theme: "dark",
      scene: "off",
      sound: "off",
      linkPreviews: "on",
    });
    expect(root.style.colorScheme).toBe("dark");
  });
});

describe("prefsScript", () => {
  it("runs standalone and applies stored preferences", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...defaultPrefs, theme: "light" })
    );
    new Function(prefsScript)();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
