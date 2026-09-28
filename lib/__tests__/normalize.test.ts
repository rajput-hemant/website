import { describe, expect, it } from "vitest";

import { normalizeName } from "../normalize";

describe("normalizeName", () => {
  it("ignores case, outer whitespace and repeated inner whitespace", () => {
    expect(normalizeName("  GLA   University\t")).toBe("gla university");
  });

  it("ignores punctuation", () => {
    expect(normalizeName("B.Tech, Computer Science and Engineering")).toBe(
      normalizeName("B.Tech Computer Science and Engineering")
    );
    expect(normalizeName("Intermediate (CBSE)")).toBe("intermediate cbse");
  });

  it("keeps non-Latin letters and digits", () => {
    expect(normalizeName("Pâtisserie  №2")).toBe("pâtisserie 2");
  });
});
