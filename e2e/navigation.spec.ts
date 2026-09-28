import { expect, test, type Page } from "@playwright/test";

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

/**
 * The visitor counter when `/api/visits` answers 503 (forced below, so this
 * holds regardless of whether Sanity is configured): the counter renders
 * nothing. That failed request is expected console/network noise: Chromium
 * logs a generic "Failed to load resource" console error for it (the message
 * carries no URL to filter on), so this narrows by matching that exact
 * generated text against the failed responses actually seen from
 * `/api/visits`, one-for-one, rather than by a substring of the text itself.
 */
function collectUnexpectedConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const expectedNoise: string[] = [];
  page.on("response", (response) => {
    if (!response.url().includes("/api/visits") || response.ok()) return;
    expectedNoise.push(
      `Failed to load resource: the server responded with a status of ${response.status()} (${response.statusText()})`
    );
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const index = expectedNoise.indexOf(message.text());
    if (index !== -1) {
      expectedNoise.splice(index, 1);
      return;
    }
    errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

test.describe("the visitor counter", () => {
  test("hides itself when /api/visits is unavailable, with no other console errors", async ({
    page,
  }) => {
    await page.route("**/api/visits", (route) =>
      route.fulfill({ status: 503 })
    );
    const errors = collectUnexpectedConsoleErrors(page);
    await gotoSettled(page, "/");
    await expect(page.getByText(/\bvisitors?\b/i)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("shows the count once /api/visits is mocked", async ({ page }) => {
    await page.route("**/api/visits", (route) =>
      route.fulfill({ json: { visitors: 12_408 } })
    );
    const visitsResponse = page
      .waitForResponse((response) => response.url().includes("/api/visits"), {
        // The counter posts only once idle (`requestIdleCallback`, up to a
        // 4s timeout), so give it more room than the suite's default
        // timeouts.
        timeout: 8_000,
      })
      .catch(() => null);
    await page.goto("/");
    const response = await visitsResponse;
    // The component now checks `isVisitCounterConfigured()` (Sanity, a write
    // token and ASK_COOKIE_SECRET) server-side before it fetches at all; a
    // mocked response can't make it visible when that's unconfigured, as it
    // is here. There's nothing left to assert without a real Sanity project.
    test.skip(
      response === null,
      "the counter is disabled server-side (no Sanity/write token/secret) and never requests /api/visits, mocked or not"
    );
    await expect(page.getByText("12,408 visitors")).toBeVisible();
  });
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

test.describe("mobile menu tools", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button is phones only");

  test("Search opens the command menu with focus in its field", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    const openButton = page.getByRole("button", { name: "Open menu" });
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(async () => {
      if (!(await menu.isVisible())) await openButton.click();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });

    await menu.getByRole("button", { name: "Search" }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByRole("combobox")).toBeFocused();
  });
});

test.describe("wide frame", () => {
  test.skip(({ isMobile }) => isMobile, "the frame starts at 1536px");

  test("sets the column off-centre, with the header over rail and column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await gotoSettled(page, "/ask");
    const wordmark = await page
      .locator("[data-site-header] a.wordmark")
      .boundingBox();
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(wordmark && heading).toBeTruthy();
    // The 15rem rail and 3rem gap sit between the wordmark and the column.
    expect(heading!.x - wordmark!.x).toBeGreaterThan(250);
    // The column sits slightly right of centre (1.5rem at any width).
    const offset = heading!.x + heading!.width / 2 - 960;
    expect(offset).toBeGreaterThan(16);
    expect(offset).toBeLessThan(32);
    await expect(
      page.getByRole("heading", { name: "How this works" })
    ).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(
      page.getByRole("heading", { name: "How this works" })
    ).toBeHidden();
  });
});
