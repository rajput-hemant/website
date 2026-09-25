import { expect, test } from "@playwright/test";

import { gotoSettled, nav, pages } from "./support/site";

test.describe("every page", () => {
  for (const { path } of pages) {
    test(`${path} responds 200 with a single h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("main#content")).toHaveCount(1);
    });
  }
});

test.describe("desktop nav", () => {
  test.skip(({ isMobile }) => isMobile, "the inline nav is hidden on phones");

  for (const item of nav) {
    test(`marks ${item.href} as the current page`, async ({ page }) => {
      const response = await page.goto(item.href);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const primary = page.getByRole("navigation", { name: "Primary" });
      const current = primary.getByRole("link", { name: item.label });
      await expect(current).toHaveAttribute("aria-current", "page");
      await expect(primary.locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  test("nested routes keep their section current", async ({ page }) => {
    await page.goto("/lab/signature-field");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary.getByRole("link", { name: "Lab" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("home has no current nav item", async ({ page }) => {
    await page.goto("/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary.locator('[aria-current="page"]')).toHaveCount(0);
  });

  test("clicking through the nav reaches every section", async ({ page }) => {
    await gotoSettled(page, "/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    for (const item of nav) {
      await primary.getByRole("link", { name: item.label }).click();
      await expect(page).toHaveURL(item.href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        primary.getByRole("link", { name: item.label })
      ).toHaveAttribute("aria-current", "page");
    }
  });

  test("the skip link is first in tab order and focuses main", async ({
    page,
  }) => {
    await gotoSettled(page, "/work");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#content")).toBeFocused();
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button is phones only");

  test("opens, navigates and closes", async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(
      page.getByRole("navigation", { name: "Primary" })
    ).toBeHidden();

    const openButton = page.getByRole("button", { name: "Open menu" });
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(async () => {
      if (!(await menu.isVisible())) await openButton.click();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });

    for (const item of nav) {
      await expect(menu.getByRole("link", { name: item.label })).toBeVisible();
    }
    await menu.getByRole("link", { name: "Projects" }).click();

    await expect(page).toHaveURL("/projects");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await openButton.click();
    await expect(menu.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("closes with Escape and with the close button", async ({ page }) => {
    await gotoSettled(page, "/");
    const openButton = page.getByRole("button", { name: "Open menu" });
    const menu = page.getByRole("dialog", { name: "Menu" });

    await expect(async () => {
      if (!(await menu.isVisible())) await openButton.click();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(openButton).toBeFocused();

    await openButton.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  });
});
