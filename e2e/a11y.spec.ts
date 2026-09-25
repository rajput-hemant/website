import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoSettled, PREFS_KEY, publicPaths } from "./support/site";

const BLOCKING = new Set(["serious", "critical"]);

// Reveals start at opacity 0 until scrolled into view; reduced motion shows them at once so
// colour contrast is measured on the settled page.
test.use({ reducedMotion: "reduce" });

for (const theme of ["light", "dark"] as const) {
  test.describe(`axe, ${theme} theme`, () => {
    test.skip(
      ({ isMobile }) => isMobile && theme === "dark",
      "dark contrast is layout-independent; covered by desktop"
    );

    for (const path of [...publicPaths, "/owner", "/does-not-exist"]) {
      test(`${path} has no serious or critical violations`, async ({
        page,
      }) => {
        await page.addInitScript(
          ([key, value]) => window.localStorage.setItem(key ?? "", value ?? ""),
          [PREFS_KEY, JSON.stringify({ theme })]
        );
        await gotoSettled(page, path);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const blocking = results.violations
          .filter((violation) => BLOCKING.has(violation.impact ?? ""))
          .map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            targets: violation.nodes.slice(0, 5).map((node) => node.target),
          }));
        expect(blocking).toEqual([]);
      });
    }
  });
}
