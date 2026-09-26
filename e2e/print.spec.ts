import { expect, test } from "@playwright/test";

import { editionFromTestInfo } from "./support/site";

test.beforeEach(({}, testInfo) => {
  test.skip(editionFromTestInfo(testInfo) !== "minimal", "Minimal-specific UI");
});

test.skip(
  ({ isMobile }) => isMobile,
  "print layout does not depend on the device"
);

test("/resume in print media hides the site chrome", async ({ page }) => {
  await page.goto("/resume");
  const header = page.locator("[data-site-header]");
  const footer = page.locator("[data-site-footer]");
  await expect(header).toBeVisible();
  await expect(footer).toBeVisible();

  await page.emulateMedia({ media: "print" });
  await expect(header).toBeHidden();
  await expect(footer).toBeHidden();
  await expect(page.getByRole("button", { name: /Print/ })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)"
  );
});
