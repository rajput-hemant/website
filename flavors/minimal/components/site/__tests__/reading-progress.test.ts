import { describe, expect, it } from "vitest";

import { hasReadingProgress } from "../reading-progress";

describe("hasReadingProgress", () => {
  it("is on for the long pages", () => {
    expect(hasReadingProgress("/changelog")).toBe(true);
    expect(hasReadingProgress("/resume")).toBe(true);
    expect(hasReadingProgress("/changelog/")).toBe(true);
  });

  it("is off everywhere else", () => {
    for (const path of ["/", "/work", "/projects", "/ask", "/changelogs"]) {
      expect(hasReadingProgress(path)).toBe(false);
    }
  });
});
