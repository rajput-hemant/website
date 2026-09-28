import { cn } from "@/flavors/mission/lib/utils";
import { expect, test } from "vitest";

test("keeps the type scale next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("label text-ink-soft")).toBe("label text-ink-soft");
  expect(cn("text-sm", "text-display")).toBe("text-display");
  expect(cn("text-h2 text-ink", "text-title")).toBe("text-ink text-title");
});
