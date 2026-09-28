import { cn } from "@/flavors/press/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("text-slug text-ink-soft")).toBe("text-slug text-ink-soft");
  expect(cn("text-sm", "text-display")).toBe("text-display");
  expect(cn("text-h2 text-ink", "text-title")).toBe("text-ink text-title");
});
