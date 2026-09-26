import { describe, expect, it } from "vitest";

import {
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
