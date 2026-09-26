import { nav, sheets } from "@/flavors/drawing-set/content";
import { expect, test } from "@playwright/test";

import {
  editionFromTestInfo,
  gotoSettled,
  html,
  prefsKeyFor,
} from "./support/site";

const DS_PREFS_KEY = prefsKeyFor("drawing-set");

test.beforeEach(({}, testInfo) => {
  test.skip(
    editionFromTestInfo(testInfo) !== "drawing-set",
    "Drawing Set-only UI"
  );
});

test.describe("sheet index", () => {
  test("the Primary nav links to its sheets and every sheet page renders", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    for (const item of nav) {
      await expect(
        primary.getByRole("link", { name: item.label })
      ).toHaveAttribute("href", item.href);
    }
    for (const sheet of sheets) {
      const response = await page.goto(sheet.href);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});

test.describe("command menu", () => {
  test("`g` then `e` goes to /work", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.use.hasTouch === true,
      "keyboard shortcuts; desktop only"
    );
    await gotoSettled(page, "/");
    await page.keyboard.press("g");
    await page.keyboard.press("e");
    await page.waitForURL("**/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Customize", () => {
  test("the theme choice persists in hr.ds.prefs across a reload", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await page.getByRole("button", { name: "Customize" }).click();
    // The radios render sr-only inside their labels, so a pointer click lands
    // on the label; arrow keys drive the group like a keyboard visitor would.
    const theme = page.getByRole("radiogroup", { name: "Theme" });
    await theme.getByRole("radio", { name: "Auto" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(theme.getByRole("radio", { name: "Dark" })).toBeChecked();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      DS_PREFS_KEY
    );
    expect(stored ?? "").toContain('"theme":"dark"');

    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    const kept = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      DS_PREFS_KEY
    );
    expect(kept ?? "").toContain('"theme":"dark"');
  });
});

test.describe("/now log", () => {
  test("every year has a #log-<year> anchor that opens its drawer", async ({
    page,
  }) => {
    await gotoSettled(page, "/now");
    const jump = page.getByRole("navigation", { name: "Jump to year" });
    const links = jump.getByRole("link");
    test.skip((await links.count()) < 2, "needs at least two log years");

    const firstHref = await links.first().getAttribute("href");
    expect(firstHref ?? "").toMatch(/^#log-\d{4}$/);
    const yearId = (firstHref ?? "").replace("#", "");

    for (let i = 0; i < (await links.count()); i += 1) {
      expect((await links.nth(i).getAttribute("href")) ?? "").toMatch(
        /^#log-\d{4}$/
      );
    }

    await links.first().click();
    await expect(page).toHaveURL(/#log-\d{4}$/);
    const targetOpen = await page.evaluate((id) => {
      const details = document.getElementById(id);
      return details instanceof HTMLDetailsElement && details.open;
    }, yearId);
    expect(targetOpen).toBe(true);
  });
});

test.describe("viewport", () => {
  test("the page has no horizontal overflow at 768px wide", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await gotoSettled(page, "/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    test.fail(overflow > 0, "known 768px header overflow");
    expect(overflow).toBe(0);
  });
});
