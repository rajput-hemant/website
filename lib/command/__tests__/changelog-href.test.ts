import { describe, expect, it } from "vitest";

import { changelogUpdateHref, flavorHasChangelogPage } from "../changelog-href";

describe("flavorHasChangelogPage", () => {
  it("is true only for Minimal", () => {
    expect(flavorHasChangelogPage("minimal")).toBe(true);
    expect(flavorHasChangelogPage("drawing-set")).toBe(false);
    expect(flavorHasChangelogPage("surface")).toBe(false);
    expect(flavorHasChangelogPage("timetable")).toBe(false);
  });
});

describe("changelogUpdateHref", () => {
  it("uses /changelog year anchors on Minimal", () => {
    expect(changelogUpdateHref("minimal", "2024")).toBe("/changelog#2024");
  });

  it("uses /now log year anchors on Drawing Set", () => {
    expect(changelogUpdateHref("drawing-set", "2024")).toBe("/now#log-2024");
  });

  it("uses /now log year anchors on Control Surface", () => {
    expect(changelogUpdateHref("surface", "2023")).toBe("/now#log-2023");
  });

  it("uses /now log year anchors on Timetable", () => {
    expect(changelogUpdateHref("timetable", "2026")).toBe("/now#log-2026");
  });
});
