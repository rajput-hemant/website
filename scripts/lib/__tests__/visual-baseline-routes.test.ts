import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  editionRoutesFromManifest,
  screenCount,
} from "../visual-baseline/routes";

describe("editionRoutesFromManifest", () => {
  it("lists only live edition paths from the prerender manifest", () => {
    const nextDir = mkdtempSync(join(tmpdir(), "visual-baseline-"));
    mkdirSync(nextDir, { recursive: true });
    writeFileSync(
      join(nextDir, "prerender-manifest.json"),
      JSON.stringify({
        routes: {
          "/f/minimal": {},
          "/f/minimal/work": {},
          "/f/drawing-set/projects": {},
          "/flavors": {},
          "/f/maquette": {},
        },
      })
    );

    const routes = editionRoutesFromManifest(nextDir);
    expect(routes.map((route) => route.urlPath)).toEqual([
      "/f/drawing-set/projects",
      "/f/minimal",
      "/f/minimal/work",
    ]);
    expect(screenCount(routes.length)).toBe(18);
  });
});
