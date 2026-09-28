// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import {
  applyStandardPrefs,
  migrateStandardPrefs,
  standardDefaults,
  standardPrefsScript,
} from "@/lib/prefs/standard";

const migrate = (stored: unknown) =>
  migrateStandardPrefs(stored, standardDefaults);

describe("migrateStandardPrefs", () => {
  it("returns the defaults for anything that is not an object", () => {
    for (const value of [null, 1, "x", [], undefined]) {
      expect(migrate(value)).toEqual(standardDefaults);
    }
  });

  it("keeps valid values and drops unknown keys and stray values", () => {
    expect(
      migrate({
        version: 1,
        theme: "dark",
        scene: "sideways",
        sound: "yes",
        motion: false,
        accent: "red",
      })
    ).toEqual({ ...standardDefaults, theme: "dark", motion: false });
  });

  it("keeps only the theme from another version", () => {
    expect(migrate({ version: 0, theme: "light", sound: true })).toEqual({
      ...standardDefaults,
      theme: "light",
    });
  });
});

describe("standardPrefsScript", () => {
  it("is valid JavaScript that names the storage key", () => {
    const source = standardPrefsScript("hr.test.prefs");
    expect(() => new Function(source)).not.toThrow();
    expect(source).toContain('"hr.test.prefs"');
  });
});

describe("applyStandardPrefs", () => {
  let dark = false;
  beforeEach(() => {
    dark = false;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("dark") ? dark : false,
    })) as unknown as typeof window.matchMedia;
    localStorage.clear();
    const root = document.documentElement;
    for (const key of Object.keys(root.dataset)) delete root.dataset[key];
  });

  it("lets an explicit theme win over the OS in both directions", () => {
    const root = document.documentElement;
    dark = true;
    applyStandardPrefs({ ...standardDefaults, theme: "light" }, root);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    dark = false;
    applyStandardPrefs({ ...standardDefaults, theme: "dark" }, root);
    expect(root.dataset.theme).toBe("dark");
    applyStandardPrefs(standardDefaults, root);
    expect(root.dataset.theme).toBe("light");
  });

  it("runs as the pre-paint script, and survives corrupt storage", () => {
    localStorage.setItem(
      "k",
      JSON.stringify({ ...standardDefaults, theme: "dark" })
    );
    new Function(standardPrefsScript("k"))();
    expect(document.documentElement.dataset.theme).toBe("dark");
    localStorage.setItem("k", "{");
    new Function(standardPrefsScript("k"))();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
