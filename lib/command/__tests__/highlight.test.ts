import { describe, expect, it } from "vitest";

import { highlightSegments } from "../highlight";

describe("highlightSegments", () => {
  it("marks each word of the query, case-insensitively", () => {
    expect(highlightSegments("JioSaavn API", "saavn api")).toEqual([
      { text: "Jio", match: false },
      { text: "Saavn", match: true },
      { text: " ", match: false },
      { text: "API", match: true },
    ]);
  });

  it("marks every occurrence and merges overlaps", () => {
    expect(highlightSegments("banana", "an ana")).toEqual([
      { text: "b", match: false },
      { text: "anana", match: true },
    ]);
  });

  it("returns the text unmarked when nothing matches", () => {
    expect(highlightSegments("Work", "xyz")).toEqual([
      { text: "Work", match: false },
    ]);
    expect(highlightSegments("Work", "  ")).toEqual([
      { text: "Work", match: false },
    ]);
  });
});
