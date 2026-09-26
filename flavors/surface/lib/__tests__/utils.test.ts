import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn", () => {
  it("keeps a custom text size next to a colour", () => {
    expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  });

  it("lets a later custom size win", () => {
    expect(cn("text-h2", "text-h3")).toBe("text-h3");
  });
});
