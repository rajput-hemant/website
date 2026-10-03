// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyPrefs,
  defaultPrefs,
  migratePrefs,
  PREFS_VERSION,
} from "../prefs";
import { prefsScript } from "../prefs-script";

function stubMedia(matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching.includes(query),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("migratePrefs", () => {
  it("falls back to defaults for junk", () => {
    expect(migratePrefs(null)).toEqual(defaultPrefs);
    expect(migratePrefs([1])).toEqual(defaultPrefs);
    expect(migratePrefs("dark")).toEqual(defaultPrefs);
  });

  it("keeps valid values and drops stray ones", () => {
    expect(
      migratePrefs({
        version: PREFS_VERSION,
        theme: "dark",
        motion: false,
        scene: "ultra",
        sound: "yes",
        extra: 1,
      })
    ).toEqual({ ...defaultPrefs, theme: "dark", motion: false });
  });

  it("keeps only the theme from an older version", () => {
    expect(
      migratePrefs({ version: 0, theme: "light", motion: false, scene: "off" })
    ).toEqual({ ...defaultPrefs, theme: "light" });
  });
});

describe("applyPrefs", () => {
  it("resolves the system theme and reduced motion", () => {
    stubMedia([
      "(prefers-color-scheme: dark)",
      "(prefers-reduced-motion: reduce)",
    ]);
    const root = document.createElement("html");
    applyPrefs(defaultPrefs, root);
    expect(root.dataset.theme).toBe("dark");
    expect(root.dataset.motion).toBe("off");
    expect(root.dataset.scene).toBe("auto");
    expect(root.dataset.sound).toBe("on");
  });

  it("honours an explicit grey edition", () => {
    stubMedia(["(prefers-color-scheme: dark)"]);
    const root = document.createElement("html");
    applyPrefs({ ...defaultPrefs, theme: "light", scene: "off" }, root);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    expect(root.dataset.motion).toBe("on");
    expect(root.dataset.scene).toBe("off");
  });
});

describe("prefsScript", () => {
  it("applies stored prefs before paint", () => {
    stubMedia([]);
    localStorage.setItem(
      "hr.cs.prefs",
      JSON.stringify({ version: PREFS_VERSION, theme: "dark", sound: true })
    );
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- the test must run the pre-paint script's source text, as the inline <script> does
    new Function(prefsScript).call(undefined);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.sound).toBe("on");
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
    stubMedia([]);
    const root = document.documentElement;
    applyPrefs({ ...defaultPrefs, haptics: false }, root);
    expect(root.dataset.haptics).toBe("off");
    applyPrefs(defaultPrefs, root);
    expect(root.dataset.haptics).toBe("on");
  });
});
