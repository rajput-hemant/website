import { expect, test } from "@playwright/test";

import { editionFromTestInfo, gotoSettled } from "./support/site";

test.beforeEach(({}, testInfo) => {
  test.skip(editionFromTestInfo(testInfo) !== "minimal", "Minimal-specific UI");
});

/**
 * The ⌘K command menu (a59e187): cmdk + Radix Dialog, lazily loaded on first
 * open.
 */
test.describe("⌘K command menu", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard shortcuts; desktop only");

  test("Meta/Control+K opens it, focused and ready to filter; Escape closes it", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCount(0);

    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    const input = page.getByRole("combobox");
    await expect(input).toBeFocused();
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("typing filters the list", async ({ page }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await page.getByRole("option").first().waitFor();

    await input.fill("jsa");
    const options = page.getByRole("option");
    await expect(options.first()).toContainText("JioSaavn");
  });

  test("Enter navigates to the selected result", async ({ page }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await page.getByRole("option").first().waitFor();

    await input.fill("lipi");
    await expect(page.getByRole("option").first()).toContainText("Lipi");
    await page.keyboard.press("Enter");

    await page.waitForURL("**/projects#lipi");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("`g w` jumps to /work", async ({ page }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("g");
    await page.keyboard.press("w");
    await page.waitForURL("**/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("`g p` inside the open menu jumps; `g` starting a word searches", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await page.getByRole("option").first().waitFor();

    await page.keyboard.type("gi");
    await expect(input).toHaveValue("gi");
    await expect(page.getByRole("dialog")).toBeVisible();

    await input.fill("");
    await page.keyboard.press("g");
    await page.keyboard.press("p");
    await page.waitForURL("**/projects");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("selecting a /projects#<slug> row opens that row's disclosure", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await page.getByRole("option").first().waitFor();

    await input.fill("jiosaavn api");
    await expect(page.getByRole("option").first()).toContainText("JioSaavn");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/projects#jiosaavn-api");

    const details = page.locator("#jiosaavn-api");
    await expect(details).toHaveJSProperty("open", true);
  });

  test("`/` opens the menu, except while typing in an input", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");

    await gotoSettled(page, "/ask");
    const field = page.getByRole("textbox", { name: "Start a conversation" });
    await field.click();
    await page.keyboard.type("hi there, use a / in this sentence please");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(field).toHaveValue(
      "hi there, use a / in this sentence please"
    );
  });

  test("copying the email announces it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await gotoSettled(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await page.getByRole("option").first().waitFor();

    await input.fill("copy email");
    await page.keyboard.press("Enter");

    const status = page.locator('p[role="status"]').last();
    await expect(status).toContainText("Copied");
    await expect(status).toContainText("clipboard");
  });
});
