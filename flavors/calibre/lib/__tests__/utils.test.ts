import { cn, cssVars } from "@/flavors/calibre/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("text-spec text-soft")).toBe("text-spec text-soft");
  expect(cn("text-sm", "text-display")).toBe("text-display");
  expect(cn("text-h2 text-ink", "text-title")).toBe("text-ink text-title");
});

test("passes custom properties through untouched", () => {
  expect(cssVars({ "--dd": "80ms" })).toEqual({ "--dd": "80ms" });
});
