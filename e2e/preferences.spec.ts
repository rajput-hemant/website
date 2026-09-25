import { expect, test } from "@playwright/test";

import {
  defaultPrefs,
  gotoSettled,
  html,
  openCustomize,
  PREFS_KEY,
  storedPrefs,
} from "./support/site";

test.use({ colorScheme: "light" });

test.describe("Customize panel", () => {
  test("dark theme survives a hard reload and applies before hydration", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    const panel = await openCustomize(page);
    await panel
      .getByRole("radiogroup", { name: "Theme" })
      .getByRole("radio", { name: "Dark" })
      .click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    expect(await storedPrefs(page)).toMatchObject({ theme: "dark" });

    const response = await page.reload({ waitUntil: "domcontentloaded" });
    // The attribute comes from the inline <head> script, not from the server or React.
    const markup = (await response?.text()) ?? "";
    const head = markup.slice(0, markup.indexOf("</head>"));
    expect(markup).not.toMatch(/<html[^>]*data-theme=/);
    expect(head).toMatch(
      new RegExp(`<script>[^<]*${PREFS_KEY.replace(".", "\\.")}`)
    );

    const firstPaint = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
    }));
    expect(firstPaint.theme).toBe("dark");
    expect(firstPaint.colorScheme).toBe("dark");
  });

  test("the system theme is resolved on first load", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(
      await page.evaluate(() => document.documentElement.dataset.theme)
    ).toBe("dark");
    await context.close();
  });

  test("accent, font and texture persist across reloads", async ({ page }) => {
    await gotoSettled(page, "/work");
    const panel = await openCustomize(page);

    await panel
      .getByRole("radiogroup", { name: "Accent" })
      .getByRole("radio", { name: "Jade" })
      .click();
    await panel
      .getByRole("radiogroup", { name: "Font" })
      .getByRole("radio", { name: "Serif" })
      .click();
    await panel
      .getByRole("radiogroup", { name: "Texture" })
      .getByRole("radio", { name: "Grid" })
      .click();

    const expectApplied = async () => {
      await expect(html(page)).toHaveAttribute("data-accent", "jade");
      await expect(html(page)).toHaveAttribute("data-font", "serif");
      await expect(html(page)).toHaveAttribute("data-texture", "grid");
      await expect(html(page)).toHaveCSS("--accent-hue", "160");
    };
    await expectApplied();
    expect(await storedPrefs(page)).toMatchObject({
      accentHue: 160,
      font: "serif",
      texture: "grid",
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectApplied();

    await page.waitForLoadState("networkidle");
    const reopened = await openCustomize(page);
    await expect(
      reopened
        .getByRole("radiogroup", { name: "Font" })
        .getByRole("radio", { name: "Serif" })
    ).toBeChecked();
    await expect(
      reopened
        .getByRole("radiogroup", { name: "Texture" })
        .getByRole("radio", { name: "Grid" })
    ).toBeChecked();
  });

  test("Reset restores the defaults", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      ([key]) =>
        window.localStorage.setItem(
          key ?? "",
          JSON.stringify({
            theme: "dark",
            accentHue: 275,
            font: "mono",
            texture: "dots",
            radius: 0,
            motion: false,
          })
        ),
      [PREFS_KEY]
    );
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(html(page)).toHaveAttribute("data-accent", "iris");

    const panel = await openCustomize(page);
    await panel.getByRole("button", { name: "Reset" }).click();

    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(html(page)).toHaveAttribute("data-accent", "ember");
    await expect(html(page)).toHaveAttribute("data-font", defaultPrefs.font);
    await expect(html(page)).toHaveAttribute(
      "data-texture",
      defaultPrefs.texture
    );
    await expect(html(page)).toHaveAttribute("data-motion", "on");
    await expect(html(page)).toHaveCSS("--radius", "6px");
    expect(await storedPrefs(page)).toEqual(defaultPrefs);
    await expect(
      panel
        .getByRole("radiogroup", { name: "Theme" })
        .getByRole("radio", { name: "Auto" })
    ).toBeChecked();
  });

  test("the panel is operable with the keyboard alone", async ({ page }) => {
    await gotoSettled(page, "/");
    const trigger = page.getByRole("button", { name: "Customize" });
    const panel = page.getByRole("dialog", { name: "Customize" });

    await trigger.focus();
    await expect(async () => {
      if (!(await panel.isVisible())) await page.keyboard.press("Enter");
      await expect(panel).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });

    const themes = panel.getByRole("radiogroup", { name: "Theme" });
    const auto = themes.getByRole("radio", { name: "Auto" });
    for (let step = 0; step < 10; step += 1) {
      if (await auto.evaluate((node) => node === document.activeElement)) {
        break;
      }
      await page.keyboard.press("Tab");
    }
    await expect(auto).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(themes.getByRole("radio", { name: "Dark" })).toBeChecked();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // Tab out of the group to the accent swatches, then pick one with arrows.
    await page.keyboard.press("Tab");
    const accents = panel.getByRole("radiogroup", { name: "Accent" });
    await expect(accents.getByRole("radio", { name: "Ember" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(html(page)).toHaveAttribute("data-accent", "saffron");

    const motion = panel.getByRole("switch", { name: "Motion" });
    await motion.focus();
    await page.keyboard.press("Space");
    await expect(motion).not.toBeChecked();
    await expect(html(page)).toHaveAttribute("data-motion", "off");

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
