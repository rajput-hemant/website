import { describe, expect, it } from "vitest";

import { generatedOgImagePath } from "../og-image-path";

describe("generatedOgImagePath", () => {
  // Values taken from a `next build` route table.
  it("matches the hashed routes Next generates inside a route group", () => {
    expect(generatedOgImagePath("/(site)/ask", "/ask")).toBe(
      "/ask/opengraph-image-5jkhl4"
    );
    expect(generatedOgImagePath("/(site)/ask/[slug]", "/ask/hello")).toBe(
      "/ask/hello/opengraph-image-14dnky"
    );
  });

  it("has no suffix outside groups", () => {
    expect(generatedOgImagePath("/", "/")).toBe("/opengraph-image");
    expect(generatedOgImagePath("/blog", "/blog/")).toBe(
      "/blog/opengraph-image"
    );
  });
});
