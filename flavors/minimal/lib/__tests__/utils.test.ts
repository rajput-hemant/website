import { cn } from "@/flavors/minimal/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes", () => {
  expect(cn("text-display", "text-foreground")).toBe(
    "text-display text-foreground"
  );
  expect(cn("text-2xs text-muted")).toBe("text-2xs text-muted");
  expect(cn("text-sm", "text-display")).toBe("text-display");
});
