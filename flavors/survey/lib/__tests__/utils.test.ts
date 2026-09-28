import { cn } from "@/flavors/survey/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("text-caps text-ink-soft")).toBe("text-caps text-ink-soft");
  expect(cn("text-sm", "text-statement")).toBe("text-statement");
});
