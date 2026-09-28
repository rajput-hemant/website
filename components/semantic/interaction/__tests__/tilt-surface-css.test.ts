import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const ROOT = join(import.meta.dirname, "../../../..");
const TILT_CSS = [
  "flavors/press/styles.css",
  "flavors/survey/styles.css",
  "flavors/timetable/styles.css",
  "flavors/drawing-set/styles.css",
] as const;

describe("tilt surface CSS", () => {
  test.each(TILT_CSS)(
    "%s applies perspective on the inner .tilt, not the host",
    (file) => {
      const css = readFileSync(join(ROOT, file), "utf8");
      expect(css).toMatch(/\[data-tilt\]\s*>\s*\.tilt\s*\{/);
      expect(css).not.toMatch(/^\s*\.tilt\s*\{[^}]*perspective/m);
    }
  );
});
