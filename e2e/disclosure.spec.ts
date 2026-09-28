import { expect, test } from "@playwright/test";

import { editionFromTestInfo } from "./support/site";

test.beforeEach(({}, testInfo) => {
  test.skip(editionFromTestInfo(testInfo) !== "minimal", "Minimal-specific UI");
});

/**
 * The shared `<details>` disclosure primitive (937a128, 4c9853f): a URL hash
 * opens the row it targets, "Expand all" toggles every role on /work, and
 * print media shows every row's collapsed content regardless of `open`.
 */
test.describe("disclosure: URL hash opens the target row", () => {
  test("/work#<role-id> opens that role", async ({ page }) => {
    await page.goto("/work");
    const first = page.locator("article[id]").first();
    const roleId = await first.getAttribute("id");
    expect(roleId).toBeTruthy();

    const details = page.locator(`#${roleId}-details`);
    await expect(details).not.toHaveJSProperty("open", true);

    await page.goto(`/work#${roleId}`);
    await expect(details).toHaveJSProperty("open", true);
  });

  test("/changelog#<older-year> opens that year", async ({ page }) => {
    await page.goto("/changelog");
    const years = page.locator("details[id]");
    const count = await years.count();
    test.skip(count < 2, "needs at least two changelog years");

    const olderYear = await years.nth(count - 1).getAttribute("id");
    expect(olderYear).toBeTruthy();
    // Years are numeric ids ("2020"); `#2020` isn't a valid CSS identifier.
    const target = page.locator(`[id="${olderYear}"]`);
    await expect(target).not.toHaveJSProperty("open", true);

    await page.goto(`/changelog#${olderYear}`);
    await expect(target).toHaveJSProperty("open", true);
  });
});

test.describe("/work: Expand all", () => {
  test("toggles every role open, then closed", async ({ page }) => {
    await page.goto("/work");
    const expandAll = page.getByRole("button", { name: "Expand all" });
    test.skip(
      (await expandAll.count()) === 0,
      "fewer than four roles: no Expand all control"
    );

    const roles = page.locator("#roles > li details");
    const count = await roles.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(roles.nth(i)).not.toHaveJSProperty("open", true);
    }

    await expandAll.click();
    for (let i = 0; i < count; i += 1) {
      await expect(roles.nth(i)).toHaveJSProperty("open", true);
    }
    await expect(
      page.getByRole("button", { name: "Collapse all" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Collapse all" }).click();
    for (let i = 0; i < count; i += 1) {
      await expect(roles.nth(i)).not.toHaveJSProperty("open", true);
    }
  });
});

test.describe("print media", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "print layout does not depend on the device"
  );

  test("shows every role's collapsed content on /work", async ({ page }) => {
    await page.goto("/work");
    const details = page.locator("#roles > li details").first();
    await expect(details).not.toHaveJSProperty("open", true);

    await page.emulateMedia({ media: "print" });
    // The disclosure stays visually closed, but its content is forced
    // visible for print via `details::details-content` in globals.css.
    const content = details.locator(":scope > div").first();
    await expect(content).toBeVisible();
  });

  test("shows the target year's content on /changelog even collapsed", async ({
    page,
  }) => {
    await page.goto("/changelog");
    const years = page.locator("details[id]");
    const count = await years.count();
    test.skip(count < 2, "needs at least two changelog years");
    const collapsed = years.nth(count - 1);
    await expect(collapsed).not.toHaveJSProperty("open", true);

    await page.emulateMedia({ media: "print" });
    const content = collapsed.locator(":scope > div").first();
    await expect(content).toBeVisible();
  });
});
