import { cn, cssVars } from "@/flavors/maquette/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("text-caps text-soft")).toBe("text-caps text-soft");
  expect(cn("text-sm", "text-display")).toBe("text-display");
  expect(cn("text-h2 text-ink", "text-title")).toBe("text-ink text-title");
});

test("passes custom properties through untouched", () => {
  expect(cssVars({ "--dd": "80ms" })).toEqual({ "--dd": "80ms" });
});
