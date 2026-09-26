import { describe, expect, it } from "vitest";

import { stackSlug } from "../stack-slug";

describe("stackSlug", () => {
  it("drops a trailing .js", () => {
    expect(stackSlug("Next.js")).toBe("next");
    expect(stackSlug("NextAuth.js")).toBe("nextauth");
  });

  it("joins words and symbols with single hyphens", () => {
    expect(stackSlug("Tailwind CSS")).toBe("tailwind-css");
    expect(stackSlug("shadcn/ui")).toBe("shadcn-ui");
    expect(stackSlug("React Three Fiber")).toBe("react-three-fiber");
  });
});
