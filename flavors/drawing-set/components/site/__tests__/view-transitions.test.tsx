import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DrawingFrame } from "../drawing-frame";

const css = readFileSync(
  new URL("../../../styles.css", import.meta.url),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

/** Every innermost rule as [selectors, declarations]. */
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
  ([, selectors = "", body = ""]): [string[], string] => [
    selectors.split(",").map((s) => s.trim()),
    body,
  ]
);

/** The declarations of every rule that targets exactly `selector`. */
function declarations(selector: string): string {
  return rules
    .filter(([selectors]) => selectors.includes(selector))
    .map(([, body]) => body)
    .join(";");
}

function zIndex(name: string): number {
  const match = declarations(`::view-transition-group(${name})`).match(
    /z-index:\s*(-?\d+)/
  );
  return match?.[1] ? Number(match[1]) : 0;
}

/** Chrome and scene stay in place across a route or theme view transition. */
const PERSISTENT = ["scene", "site-header", "site-dock", "drawing-frame"];

describe("drawing set view transitions", () => {
  it("gives the drawing frame its own group", () => {
    const html = renderToStaticMarkup(<DrawingFrame />);
    expect(html).toContain("view-transition-name:drawing-frame");
  });

  it.each(PERSISTENT)(
    "%s drops its old snapshot and shows the live new one",
    (name) => {
      expect(declarations(`::view-transition-old(${name})`)).toMatch(
        /display:\s*none/
      );
      expect(declarations(`::view-transition-new(${name})`)).toMatch(
        /animation:\s*none/
      );
    }
  );

  // The root snapshot is opaque: a group under it vanishes for the whole
  // transition (the desk disappearing on a theme change).
  it.each(PERSISTENT)("%s never sits under the root snapshot", (name) => {
    expect(zIndex(name)).toBeGreaterThanOrEqual(0);
  });

  it("keeps the frame over the header and dock, as it is live", () => {
    expect(zIndex("drawing-frame")).toBeGreaterThan(zIndex("site-header"));
    expect(zIndex("drawing-frame")).toBeGreaterThan(zIndex("site-dock"));
  });

  it("crossfades the chrome with the root on a theme change", () => {
    for (const name of ["site-header", "site-dock", "drawing-frame"]) {
      const theme = declarations(
        `:root[data-theme-exposure]::view-transition-old(${name})`
      );
      expect(theme).toMatch(/display:\s*block/);
      expect(theme).toMatch(/animation:/);
    }
  });
});
