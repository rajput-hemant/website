// @vitest-environment jsdom
import {
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
  prefsScript,
} from "@/flavors/darkroom/lib/prefs";
import { afterEach, describe, expect, it, vi } from "vitest";

function mockMedia(matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching.includes(query),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("darkroom prefs", () => {
  it("starts with every switch on and the theme following the OS", () => {
    expect(defaultPrefs).toMatchObject({
      theme: "system",
      sound: true,
      motion: true,
      scene: "auto",
    });
  });

  it("stores under its own key, apart from every other edition", () => {
    expect(PREFS_KEY).toBe("hr.dr.prefs");
    expect(PREFS_KEY).not.toBe("hr.pp.prefs");
  });

  it("drops malformed values", () => {
    expect(
      migratePrefs({ ...defaultPrefs, theme: "sepia", sound: "yes", x: 1 })
    ).toEqual(defaultPrefs);
    expect(migratePrefs(null)).toEqual(defaultPrefs);
  });

  it("follows the OS until a theme is chosen, then the choice wins", () => {
    mockMedia(["(prefers-color-scheme: dark)"]);
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root);
    expect(root.dataset.theme).toBe("dark");
    applyPrefs({ ...defaultPrefs, theme: "light" }, root);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
  });

  it("turns motion off when the OS asks for reduced motion", () => {
    mockMedia(["(prefers-reduced-motion: reduce)"]);
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root);
    expect(root.dataset.motion).toBe("off");
    expect(root.dataset.sound).toBe("on");
  });

  it("ships a pre-paint script that reads this edition's key", () => {
    mockMedia([]);
    window.localStorage.setItem(
      PREFS_KEY,
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
});
