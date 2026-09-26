import { defaultPrefs, PREFS_KEY } from "@/flavors/minimal/lib/prefs";
import { expect, test } from "@playwright/test";

import {
  editionFromTestInfo,
  gotoSettled,
  html,
  openCustomize,
  openEffects,
  storedPrefs,
  waitForNetworkIdleBounded,
} from "./support/site";

test.beforeEach(({}, testInfo) => {
  test.skip(editionFromTestInfo(testInfo) !== "minimal", "Minimal-specific UI");
});

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
    expect(await storedPrefs(page, PREFS_KEY)).toMatchObject({ theme: "dark" });

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

  test("accent and font persist across reloads", async ({ page }) => {
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

    const expectApplied = async () => {
      await expect(html(page)).toHaveAttribute("data-accent", "jade");
      await expect(html(page)).toHaveAttribute("data-font", "serif");
      await expect(html(page)).toHaveCSS("--accent-hue", "160");
    };
    await expectApplied();
    expect(await storedPrefs(page, PREFS_KEY)).toMatchObject({
      accentHue: 160,
      font: "serif",
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectApplied();

    await waitForNetworkIdleBounded(page);
    const reopened = await openCustomize(page);
    await expect(
      reopened
        .getByRole("radiogroup", { name: "Font" })
        .getByRole("radio", { name: "Serif" })
    ).toBeChecked();
  });

  test("the Font control offers Sans, Serif and Mono", async ({ page }) => {
    await gotoSettled(page, "/");
    const panel = await openCustomize(page);
    const fontGroup = panel.getByRole("radiogroup", { name: "Font" });

    await expect(fontGroup.getByRole("radio", { name: "Sans" })).toBeChecked();
    await expect(
      fontGroup.getByRole("radio", { name: "Serif" })
    ).not.toBeChecked();

    await fontGroup.getByRole("radio", { name: "Mono" }).click();
    await expect(html(page)).toHaveAttribute("data-font", "mono");
    expect(await storedPrefs(page, PREFS_KEY)).toMatchObject({ font: "mono" });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(html(page)).toHaveAttribute("data-font", "mono");
    await waitForNetworkIdleBounded(page);
    const reopened = await openCustomize(page);
    await expect(
      reopened
        .getByRole("radiogroup", { name: "Font" })
        .getByRole("radio", { name: "Mono" })
    ).toBeChecked();
  });

  test("--radius is a fixed token, not a preference", async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(html(page)).toHaveCSS("--radius", "6px");
    const panel = await openCustomize(page);
    await expect(panel.getByRole("radiogroup", { name: "Radius" })).toHaveCount(
      0
    );
    await expect(panel.getByText(/radius/i)).toHaveCount(0);
  });

  test("the Effects disclosure: link previews, cursor, smooth scroll, sound and texture persist", async ({
    page,
  }) => {
    await gotoSettled(page, "/work");
    const panel = await openCustomize(page);
    await openEffects(panel);

    // Defaults: link previews on, everything else off.
    await expect(
      panel.getByRole("switch", { name: "Link previews" })
    ).toBeChecked();
    await expect(
      panel.getByRole("switch", { name: "Cursor follower" })
    ).not.toBeChecked();
    await expect(
      panel.getByRole("switch", { name: "Smooth scroll" })
    ).not.toBeChecked();
    await expect(
      panel.getByRole("switch", { name: "Sound" })
    ).not.toBeChecked();

    await panel.getByRole("switch", { name: "Cursor follower" }).click();
    await panel.getByRole("switch", { name: "Smooth scroll" }).click();
    await panel
      .getByRole("radiogroup", { name: "Texture" })
      .getByRole("radio", { name: "Grid" })
      .click();

    const expectApplied = async () => {
      await expect(html(page)).toHaveAttribute("data-cursor", "on");
      await expect(html(page)).toHaveAttribute("data-smooth-scroll", "on");
      await expect(html(page)).toHaveAttribute("data-texture", "grid");
    };
    await expectApplied();
    expect(await storedPrefs(page, PREFS_KEY)).toMatchObject({
      cursor: true,
      smoothScroll: true,
      texture: "grid",
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectApplied();

    await waitForNetworkIdleBounded(page);
    const reopened = await openCustomize(page);
    await openEffects(reopened);
    await expect(
      reopened.getByRole("switch", { name: "Cursor follower" })
    ).toBeChecked();
    await expect(
      reopened.getByRole("switch", { name: "Smooth scroll" })
    ).toBeChecked();
    await expect(
      reopened
        .getByRole("radiogroup", { name: "Texture" })
        .getByRole("radio", { name: "Grid" })
    ).toBeChecked();
  });

  test("the Texture picker offers every texture, fits the panel, and fetches the contour tile only for Topo", async ({
    page,
  }) => {
    const tileRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/textures/"))
        tileRequests.push(request.url());
    });

    await gotoSettled(page, "/work");
    const panel = await openCustomize(page);
    await openEffects(panel);
    const picker = panel.getByRole("radiogroup", { name: "Texture" });
    await picker.scrollIntoViewIfNeeded();

    const labels = [
      "None",
      "Noise",
      "Grid",
      "Dots",
      "Ruled",
      "Graph",
      "Hatch",
      "Topo",
    ];
    for (const name of labels) {
      await expect(picker.getByRole("radio", { name })).toBeVisible();
    }
    // Four to a row, wrapping: no tile pokes out of the panel at phone widths.
    const panelBox = await panel.boundingBox();
    for (const name of labels) {
      const box = await picker.getByRole("radio", { name }).boundingBox();
      expect(box, name).not.toBeNull();
      expect(box!.x, name).toBeGreaterThanOrEqual(panelBox!.x);
      expect(box!.x + box!.width, name).toBeLessThanOrEqual(
        panelBox!.x + panelBox!.width
      );
    }
    // The swatches draw a stand-in, so opening the picker fetches nothing.
    expect(tileRequests).toEqual([]);

    await picker.getByRole("radio", { name: "Graph" }).click();
    await expect(html(page)).toHaveAttribute("data-texture", "graph");
    expect(tileRequests).toEqual([]);

    await picker.getByRole("radio", { name: "Topo" }).click();
    await expect(html(page)).toHaveAttribute("data-texture", "topo");
    await expect
      .poll(() => tileRequests.some((url) => url.endsWith("/topo-light.svg")))
      .toBe(true);
    expect(tileRequests.some((url) => url.endsWith("/topo-dark.svg"))).toBe(
      false
    );
    expect(await storedPrefs(page, PREFS_KEY)).toMatchObject({
      texture: "topo",
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(html(page)).toHaveAttribute("data-texture", "topo");
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
    expect(await storedPrefs(page, PREFS_KEY)).toEqual(defaultPrefs);
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
