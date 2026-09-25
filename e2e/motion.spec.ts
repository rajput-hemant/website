import { expect, test, type Page } from "@playwright/test";

import { cursorLayer, gotoSettled, html } from "./support/site";

const REVEAL = '[class*="reveal-module__"]';

async function revealStyles(page: Page) {
  return page.locator(REVEAL).evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      return { opacity: style.opacity, transform: style.transform };
    })
  );
}

test.describe("fine pointer, motion allowed", () => {
  test.skip(({ hasTouch }) => hasTouch, "desktop pointer only");

  // Proves the selectors used by the negative checks below find the real layers.
  test("Lenis and the cursor follower are mounted", async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page).first()).toBeAttached();
    await expect(cursorLayer(page).first()).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(cursorLayer(page).first()).toHaveCSS("pointer-events", "none");
  });

  test("turning smooth scroll and cursor off unmounts them", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() =>
      window.localStorage.setItem(
        "hr.prefs",
        JSON.stringify({ smoothScroll: false, cursor: false })
      )
    );
    await gotoSettled(page, "/");
    await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page)).toHaveCount(0);
  });
});

test.describe("prefers-reduced-motion: reduce", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of ["/", "/work", "/projects"]) {
    test(`${path}: no Lenis, no cursor, reveals fully visible`, async ({
      page,
    }) => {
      await gotoSettled(page, path);
      await expect(html(page)).toHaveAttribute("data-motion", "off");
      await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
      await expect(cursorLayer(page)).toHaveCount(0);

      const reveals = await revealStyles(page);
      expect(
        reveals.length,
        "page should contain reveal blocks"
      ).toBeGreaterThan(0);
      for (const style of reveals) {
        expect(style.opacity).toBe("1");
        expect(style.transform).toBe("none");
      }
    });
  }

  test("the Customize panel explains the system setting", async ({ page }) => {
    await gotoSettled(page, "/");
    await page.getByRole("button", { name: "Customize" }).click();
    const panel = page.getByRole("dialog", { name: "Customize" });
    await expect(
      panel.getByText("Reduced motion is on in your system")
    ).toBeVisible();
    await expect(panel.getByRole("switch", { name: "Motion" })).toHaveAttribute(
      "aria-describedby",
      /.+/
    );
  });
});

test.describe("touch device", () => {
  test.skip(({ hasTouch }) => !hasTouch, "mobile project only");

  test("no cursor follower and no Lenis", async ({ page }) => {
    await gotoSettled(page, "/");
    // Touch alone must be enough: the preference defaults are on.
    await expect(html(page)).toHaveAttribute("data-cursor", "on");
    await expect(html(page)).toHaveAttribute("data-smooth-scroll", "on");
    await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page)).toHaveCount(0);

    await page.getByRole("heading", { level: 1 }).tap();
    await expect(cursorLayer(page)).toHaveCount(0);
  });
});
