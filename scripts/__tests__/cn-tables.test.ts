import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cn as drawingSet } from "@/flavors/drawing-set/lib/utils";
import { cn as jacquard } from "@/flavors/jacquard/lib/utils";
import { cn as minimal } from "@/flavors/minimal/lib/utils";
import { cn as press } from "@/flavors/press/lib/utils";
import { flavors } from "@/flavors/registry";
import { cn as surface } from "@/flavors/surface/lib/utils";
import { cn as survey } from "@/flavors/survey/lib/utils";
import { cn as timetable } from "@/flavors/timetable/lib/utils";
import { clsx } from "cn";
import { extractTokens } from "cn/build";
import { extendTailwindMerge } from "cn/config";
import { describe, expect, test } from "vitest";

import { compileEditionTables, editionConfigs, tablesPath } from "../cn-tables";

const editionCn: Record<string, typeof minimal> = {
  "drawing-set": drawingSet,
  jacquard,
  minimal,
  press,
  surface,
  survey,
  timetable,
};

/** Every class-name candidate in an edition's own sources. */
function editionTokens(flavor: string): string[] {
  const root = join(import.meta.dirname, "..", "..", "flavors", flavor);
  const tokens = new Set<string>();
  for (const file of readdirSync(root, { recursive: true }).map(String)) {
    if (!/\.tsx?$/.test(file) || file.endsWith("cn-tables.ts")) continue;
    extractTokens(readFileSync(join(root, file), "utf8"), tokens);
  }
  return [...tokens].sort();
}

test("every live edition has a merge config", () => {
  const live = Object.entries(flavors)
    .filter(([, meta]) => meta.status === "live")
    .map(([id]) => id);
  expect(Object.keys(editionConfigs).sort()).toEqual(live.sort());
});

describe.each(Object.entries(editionConfigs))("%s", (flavor, extension) => {
  test("committed tables match the config (run `bun run cn:tables`)", () => {
    expect(readFileSync(tablesPath(flavor), "utf8")).toBe(
      compileEditionTables(extension)
    );
  });

  test("merges exactly like the runtime-compiled config", () => {
    const cn = editionCn[flavor];
    const runtime = extendTailwindMerge(extension);
    const tokens = editionTokens(flavor);
    expect(cn).toBeDefined();
    // Neighbouring tokens in sorted order share prefixes, so windows of
    // them exercise real conflicts (text-sm next to text-display, etc.).
    for (let i = 0; i < tokens.length; i += 3) {
      const inputs = tokens.slice(i, i + 8);
      expect(cn?.(...inputs)).toBe(runtime(clsx(inputs)));
    }
  });
});
