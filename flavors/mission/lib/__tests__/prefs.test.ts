// @vitest-environment jsdom
import {
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
  PREFS_VERSION,
  prefsScript,
} from "@/flavors/mission/lib/prefs";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  // A matchMedia that reports dark and reduced motion, so `system` resolves.
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("dark"),
      media: query,
    }),
  });
});

describe("prefs", () => {
  it("keeps its own storage key", () => {
    expect(PREFS_KEY).toBe("hr.fp.prefs");
  });

  it("defaults to the OS theme, motion and sound on", () => {
    expect(defaultPrefs).toMatchObject({
      theme: "system",
      motion: true,
      sound: true,
      scene: "auto",
    });
  });
});

describe("migratePrefs", () => {
  it.each([
    ["null", null],
    ["a string", "dark"],
    ["an array", ["dark"]],
  ])("returns the defaults for %s", (_label, stored) => {
    expect(migratePrefs(stored)).toEqual(defaultPrefs);
  });

  it("keeps only the theme from an older version", () => {
    const old = { version: 0, theme: "light", motion: false, sound: true };
    expect(migratePrefs(old)).toEqual({ ...defaultPrefs, theme: "light" });
  });

  it("drops malformed values and unknown keys", () => {
    const bad = {
      version: PREFS_VERSION,
      theme: "sepia",
      scene: 3,
      motion: "yes",
      loom: "night",
    };
    expect(migratePrefs(bad)).toEqual(defaultPrefs);
  });
});

describe("applyPrefs", () => {
  it("lets an explicit light choice win over a dark OS", () => {
    const root = document.createElement("html");
    applyPrefs({ ...defaultPrefs, theme: "light" }, root);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
  });

  it("follows the OS when the theme is system", () => {
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root);
    expect(root.dataset).toMatchObject({
      theme: "dark",
      sound: "on",
      scene: "auto",
    });
  });
});

describe("prefsScript", () => {
  it("runs standalone and applies stored preferences", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...defaultPrefs, theme: "light", sound: false })
    );
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- the test deliberately evaluates the inline script source standalone, as the browser does
    new Function(prefsScript)();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.sound).toBe("off");
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
});
