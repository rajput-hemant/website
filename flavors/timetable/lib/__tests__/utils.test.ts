import { cn } from "@/flavors/timetable/lib/utils";
import { expect, test } from "vitest";

test("keeps custom sizes next to colour classes", () => {
  expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
  expect(cn("text-mono-xs text-ink-soft")).toBe("text-mono-xs text-ink-soft");
  expect(cn("text-sm", "text-display")).toBe("text-display");
  expect(cn("text-h2 text-signal", "text-lead")).toBe("text-signal text-lead");
});
