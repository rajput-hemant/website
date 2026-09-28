import { describe, expect, it } from "vitest";

import { clampQuestion } from "../og-card";

describe("clampQuestion", () => {
  it("collapses whitespace and leaves short questions untouched", () => {
    expect(clampQuestion("  What is   your   stack?  ")).toBe(
      "What is your stack?"
    );
  });

  it("converts straight apostrophes to typographic ones", () => {
    expect(clampQuestion("What's next?")).toBe("What’s next?");
  });

  it("truncates at a word boundary and adds an ellipsis past the limit", () => {
    const long = `${"word ".repeat(60)}tail`; // well over 200 characters
    const result = clampQuestion(long);
    expect(result.length).toBeLessThanOrEqual(201);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/\s…$/);
  });

  it("strips trailing punctuation before the ellipsis", () => {
    const long = `${"word, ".repeat(40)}tail`;
    const result = clampQuestion(long);
    expect(result.endsWith("…")).toBe(true);
    expect(result.slice(0, -1)).not.toMatch(/[\s,.;:!?-]$/);
  });
});
