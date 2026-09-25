import { describe, expect, it } from "vitest";

import { normalizeName } from "../normalize";

describe("normalizeName", () => {
  it("ignores case, outer whitespace and repeated inner whitespace", () => {
    expect(normalizeName("  GLA   University\t")).toBe("gla university");
  });
});
