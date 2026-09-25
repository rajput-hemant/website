import { expect, test } from "@playwright/test";

import { previewableLink } from "@/lib/link-previews/rules";

import { gotoSettled } from "./support/site";

/**
 * Hover cards for content links (fa281b6): no card on links to `/`, inside
 * `[data-contact]`, or in the header, nav and footer; internal subpages still
 * get one. Fine pointer only (desktop project).
 */
test.describe("link previews", () => {
  test.skip(({ hasTouch }) => hasTouch, "fine pointer only");

  test("an internal subpage link in the body gets a card", async ({ page }) => {
    await gotoSettled(page, "/");
    // The intro's "work"/"projects"/"lab" links live inside the intro's own
    // <header>, which (like the site chrome) is a quiet region; "More"'s
    // onward links sit in a plain <section> instead.
    const more = page.locator("details#more");
    await more.locator(":scope > summary").click();
    const fullList = more.getByRole("link", { name: "Full list" });
    await expect(fullList).toHaveAttribute("href", "/now");
    await expect(fullList).toBeVisible();
    await fullList.hover();

    const card = page.locator("[data-link-preview]");
    await expect(card).toBeVisible({ timeout: 3_000 });
    await expect(card).toContainText("Now");
  });

  test("a link inside the contact row never gets a card", async ({ page }) => {
    await gotoSettled(page, "/");
    const github = page.locator("[data-contact]").getByRole("link", {
      name: /^GitHub/,
    });
    await github.hover();
    await page.waitForTimeout(600);
    await expect(page.locator("[data-link-preview]")).toHaveCount(0);
  });

  test("a header/nav link never gets a card", async ({ page }) => {
    await gotoSettled(page, "/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("link", { name: "Work" }).hover();
    await page.waitForTimeout(600);
    await expect(page.locator("[data-link-preview]")).toHaveCount(0);
  });

  test("a footer link never gets a card", async ({ page }) => {
    await gotoSettled(page, "/work");
    const footer = page.locator("[data-site-footer]");
    const mirror = footer.getByRole("link", { name: "View as markdown" });
    await mirror.hover();
    await page.waitForTimeout(600);
    await expect(page.locator("[data-link-preview]")).toHaveCount(0);
  });
});

test.describe("link preview rules (unit)", () => {
  const context = {
    origin: "https://example.com",
    siteHosts: ["example.com", "www.example.com"],
  };

  test("the home page never earns a card, on- or off-site", () => {
    expect(previewableLink("/", context)).toBeNull();
    expect(previewableLink("https://example.com/", context)).toBeNull();
    expect(previewableLink("https://www.example.com/", context)).toBeNull();
  });

  test("an internal subpage does", () => {
    expect(previewableLink("/work", context)).toEqual({
      external: false,
      key: "/work",
    });
  });
});
