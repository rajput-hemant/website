import { expect, test, type Page } from "@playwright/test";

import {
  cursorLayer,
  gotoSettled,
  html,
  PREFS_KEY,
  PREFS_VERSION,
} from "./support/site";

/** Direct children of a `.stagger` group, or a lone `.stagger-self` block. */
const STAGGER = ".stagger > *, .stagger-self";

async function staggerStyles(page: Page) {
  return page.locator(STAGGER).evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      return { opacity: style.opacity, transform: style.transform };
    })
  );
}

/**
 * Turns smooth scroll and the cursor follower on: both default off. Carries
 * the current `version`, or `migrateStoredPrefs` treats the write as
 * pre-dating the calmer defaults and drops exactly these keys back to off.
 *
 * Uses `addInitScript`, which reruns before every subsequent navigation on
 * this page — fine for tests that load the page once afterwards, but it will
 * silently re-enable the extras on a *second* load, undoing any later
 * `setMotionExtras`. Tests that need to change prefs more than once should
 * call `setMotionExtras` (a one-off `page.evaluate`) instead.
 */
async function enableMotionExtras(page: Page) {
  await page.addInitScript(
    ([key, version]: [string, number]) =>
      window.localStorage.setItem(
        key,
        JSON.stringify({ version, smoothScroll: true, cursor: true })
      ),
    [PREFS_KEY, PREFS_VERSION] as [string, number]
  );
}

type ExtrasPatch = { smoothScroll: boolean; cursor: boolean };

/** A one-off write, for when a test needs to change prefs partway through. */
async function setMotionExtras(page: Page, patch: ExtrasPatch) {
  await page.evaluate(
    ([key, version, patch]: [string, number, ExtrasPatch]) =>
      window.localStorage.setItem(key, JSON.stringify({ version, ...patch })),
    [PREFS_KEY, PREFS_VERSION, patch] as [string, number, ExtrasPatch]
  );
}

test.describe("first paint entrance (.stagger / .stagger-self)", () => {
  for (const path of ["/", "/work", "/projects"]) {
    test(`${path}: content is visible without JavaScript`, async ({
      browser,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "javaScriptEnabled: false is a Chromium-only context option"
      );
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const styles = await staggerStyles(page);
      expect(styles.length).toBeGreaterThan(0);
      await context.close();
    });
  }

  test("nothing is hidden before hydration: reveal blocks start opaque in markup", async ({
    page,
  }) => {
    const response = await page.goto("/", { waitUntil: "commit" });
    const markup = (await response?.text()) ?? "";
    // No inline style or class hides the staggered blocks pre-hydration; the
    // entrance is a `@keyframes` animation layered on top of visible content.
    expect(markup).not.toMatch(/style="[^"]*opacity:\s*0/);
  });
});

test.describe("fine pointer, smooth scroll and cursor turned on", () => {
  test.skip(({ hasTouch }) => hasTouch, "desktop pointer only");

  test("Lenis and the cursor follower mount once enabled", async ({ page }) => {
    await enableMotionExtras(page);
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page).first()).toBeAttached();
    await expect(cursorLayer(page).first()).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(cursorLayer(page).first()).toHaveCSS("pointer-events", "none");
  });

  test("cursor and smooth scroll default off", async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveAttribute("data-cursor", "off");
    await expect(html(page)).toHaveAttribute("data-smooth-scroll", "off");
    await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page)).toHaveCount(0);
  });

  test("turning smooth scroll and cursor back off unmounts them", async ({
    page,
  }) => {
    // Not `enableMotionExtras`: its `addInitScript` reruns on every future
    // navigation on this page, so it would silently re-enable both extras
    // again on the second load below. A plain page load first, then two
    // one-off writes, matches how a real visitor's toggle would behave.
    await gotoSettled(page, "/");
    await setMotionExtras(page, { smoothScroll: true, cursor: true });
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveClass(/(^|\s)lenis(\s|$)/);

    await setMotionExtras(page, { smoothScroll: false, cursor: false });
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
      await enableMotionExtras(page);
      await gotoSettled(page, path);
      await expect(html(page)).toHaveAttribute("data-motion", "off");
      await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
      await expect(cursorLayer(page)).toHaveCount(0);

      const styles = await staggerStyles(page);
      expect(
        styles.length,
        "page should contain staggered blocks"
      ).toBeGreaterThan(0);
      for (const style of styles) {
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

  test("no cursor follower and no Lenis even with the touch defaults", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveAttribute("data-cursor", "off");
    await expect(html(page)).toHaveAttribute("data-smooth-scroll", "off");
    await expect(html(page)).not.toHaveClass(/(^|\s)lenis(\s|$)/);
    await expect(cursorLayer(page)).toHaveCount(0);

    await page.getByRole("heading", { level: 1 }).tap();
    await expect(cursorLayer(page)).toHaveCount(0);
  });
});
