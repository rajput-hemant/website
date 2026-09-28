import { expect, test } from "@playwright/test";

import {
  editionFromTestInfo,
  gotoSettled,
  type EditionId,
} from "./support/site";

/**
 * How far the search row may sit below the popup's top edge: the popup's
 * border, or more where an edition frames the field on purpose (Surface
 * insets it inside the faceplate's bezel).
 */
const flushAllowance: Partial<Record<EditionId, number>> = { surface: 10 };

/**
 * The ⌘K dialog's contracts that every edition shares, run on each edition
 * the suite covers: the `g` jump navigates, the list takes the wheel and the
 * page behind stays put, and the field sits flush at the top of the popup.
 */
test.describe("⌘K dialog", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard and wheel; desktop only");

  test.beforeEach(async ({ page }) => {
    await gotoSettled(page, "/");
    // The shortcut binds after hydration, which a busy machine can delay past
    // the settled load; press again only while the menu is still closed.
    await expect(async () => {
      if (!(await page.getByRole("dialog").isVisible())) {
        await page.keyboard.press("Control+k");
      }
      await expect(page.getByRole("option").first()).toBeVisible({
        timeout: 3_000,
      });
    }).toPass();
  });

  test("opens with the search field focused", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeFocused();
  });

  test("`g` then the Projects key closes the menu and opens Projects", async ({
    page,
  }) => {
    // Each edition picks its own key; the menu shows it on the Projects row.
    const projects = page
      .getByRole("option")
      .filter({ hasText: /projects/i })
      .filter({ has: page.locator("kbd") })
      .first();
    const key = (await projects.locator("kbd").last().innerText()).trim();

    await page.keyboard.press("g");
    await page.keyboard.press(key.toLowerCase());

    await page.waitForURL("**/projects");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the wheel scrolls the list, never the page behind", async ({
    page,
  }) => {
    const list = page.locator("[cmdk-list]");
    const box = await list.boundingBox();
    if (!box) throw new Error("the list is not on screen");
    const before = await page.evaluate(() => window.scrollY);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 400);

    await expect
      .poll(() => list.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await page.mouse.move(box.x + box.width / 2, 4);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("once the menu is closed, the wheel scrolls the page again", async ({
    page,
  }) => {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const before = await page.evaluate(() => window.scrollY);

    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 600);

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(before);
  });

  test("the search field sits flush at the top of the popup", async ({
    page,
  }, testInfo) => {
    const gap = await page.locator("[cmdk-input]").evaluate((input) => {
      const popup = input.closest("[role=dialog]");
      const row = input.parentElement;
      if (!popup || !row) return Number.NaN;
      return (
        row.getBoundingClientRect().top - popup.getBoundingClientRect().top
      );
    });
    // At most the popup's border, or the edition's bezel.
    expect(gap).toBeLessThanOrEqual(
      flushAllowance[editionFromTestInfo(testInfo)] ?? 2
    );
  });
});
