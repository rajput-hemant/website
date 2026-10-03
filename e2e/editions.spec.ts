import { expect, test, type Locator, type Page } from "@playwright/test";

import { projects } from "@/content/fallback";

import {
  editionFromTestInfo,
  gotoSettled,
  html,
  prefsKeyFor,
  publicPaths,
  storedPrefs,
  type EditionId,
} from "./support/site";

/**
 * The shared shell every newer edition carries (Minimal and Drawing Set have
 * their own, deeper specs): every route renders, ⌘K opens and navigates,
 * Customize opens and sets the theme, the header's theme control flips it and
 * the choice survives a reload, and unknown URLs render the edition's 404.
 * Axe runs over the same routes from `a11y.spec.ts`.
 */
type ThemeControl =
  | {
      /** A header button, named for where it takes you from each theme. */
      role: "button" | "switch";
      fromLight: string;
      fromDark: string;
      /** False when phones drop it from the header and keep the theme in Customize. */
      phone: boolean;
    }
  /** No header control: the theme lives only in Customize. */
  | null;

type EditionShape = {
  /** Customize's theme radio group label and its dark option, or null when the edition has no Customize panel. */
  customize: { group: string; dark: string } | null;
  theme: ThemeControl;
};

const shapes: Partial<Record<EditionId, EditionShape>> = {
  surface: {
    customize: null,
    theme: {
      role: "switch",
      fromLight: "Black edition (dark theme)",
      fromDark: "Black edition (dark theme)",
      phone: true,
    },
  },
  timetable: { customize: { group: "Theme", dark: "Night" }, theme: null },
  survey: {
    customize: { group: "Theme", dark: "Night chart" },
    theme: {
      role: "button",
      fromLight: "Night chart",
      fromDark: "Day sheet",
      phone: true,
    },
  },
  press: {
    customize: { group: "Proof", dark: "Plate" },
    theme: {
      role: "button",
      fromLight: "Plate view",
      fromDark: "Plate view",
      phone: false,
    },
  },
  darkroom: {
    customize: { group: "Light", dark: "Safelight" },
    theme: {
      role: "button",
      fromLight: "Switch to the safelight",
      fromDark: "Switch to the light table",
      phone: false,
    },
  },
  jacquard: {
    customize: { group: "Loom", dark: "Night" },
    theme: {
      role: "button",
      fromLight: "Switch to the night loom",
      fromDark: "Switch to the day loom",
      phone: false,
    },
  },
  maquette: {
    customize: { group: "Light", dark: "Night" },
    theme: {
      role: "button",
      fromLight: "Switch to night, one spotlight",
      fromDark: "Switch to daylight",
      phone: true,
    },
  },
  mission: {
    customize: { group: "Theme", dark: "Orbit" },
    theme: {
      role: "button",
      fromLight: "Switch to orbit, dark",
      fromDark: "Switch to paper, light",
      phone: false,
    },
  },
  calibre: {
    customize: { group: "Light", dark: "Caseback" },
    theme: {
      role: "button",
      fromLight: "Show the caseback (dark theme)",
      fromDark: "Show the dial (light theme)",
      phone: false,
    },
  },
};

function shapeFor(edition: EditionId): EditionShape {
  const shape = shapes[edition];
  if (!shape) throw new Error(`no edition shape for ${edition}`);
  return shape;
}

const routes: readonly string[] = [
  ...publicPaths,
  "/owner",
  ...projects.map((project) => `/projects/${project.slug}`),
];

/** The first visible match: headers render a desktop and a phone copy of some controls. */
const visible = (locator: Locator) => locator.filter({ visible: true }).first();

/**
 * Clicks until hydration has wired the control up and `done` holds. A click
 * that landed renames most toggles, so it only clicks again while the target
 * is still there, and `done` gets long enough that a slow theme swap is not
 * mistaken for a dead click.
 */
async function clickUntil(target: Locator, done: () => Promise<void>) {
  await expect(async () => {
    if (await target.isVisible()) await target.click({ timeout: 2_000 });
    await done();
  }).toPass({ timeout: 15_000 });
}

/** Clicks `trigger` until hydration has wired it up and `panel` shows; never clicks an open panel shut. */
async function openWith(trigger: Locator, panel: Locator) {
  await expect(async () => {
    if (!(await panel.isVisible())) await trigger.click({ timeout: 2_000 });
    await expect(panel).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 10_000 });
}

/** Presses Control+K until hydration has wired the shortcut up; never toggles an open menu shut. */
async function openCommandMenu(page: Page) {
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    if (!(await dialog.isVisible())) await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 10_000 });
}

/**
 * Opens `panel` from `trigger`, then presses the trigger again with the mouse.
 * A modal hides the trigger from the accessibility tree, so its box is read
 * first and it is pressed by where it sits, as a visitor would. The panel must
 * close and stay closed.
 */
async function openThenToggleShut(
  page: Page,
  trigger: Locator,
  panel: Locator
) {
  const box = await trigger.boundingBox();
  if (!box) throw new Error("the trigger has no box to press");
  await openWith(trigger, panel);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, {
    delay: 60,
  });
  await expect(panel).toBeHidden();
  // A press that closed on pointerdown must not reopen on click.
  await page.waitForTimeout(400);
  await expect(panel).toBeHidden();
}

async function expectTheme(
  page: Page,
  theme: "light" | "dark",
  timeout?: number
) {
  await expect(html(page)).toHaveAttribute("data-theme", theme, {
    ...(timeout !== undefined && { timeout }),
  });
}

test.use({ colorScheme: "light" });

test.describe("every route", () => {
  for (const path of routes) {
    test(`${path} responds 200 with a single visible h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toBeVisible();
      await expect(page.getByRole("main")).toHaveCount(1);
    });
  }

  test("an unknown URL answers 404 with the edition's own page", async ({
    page,
  }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
    // The edition's shell, not the bare global fallback.
    await expect(page.locator('a[href="/"]').first()).toBeAttached();
  });
});

test.describe("⌘K command menu", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard shortcuts; desktop only");

  test("Control+K opens it focused; Escape closes it", async ({ page }) => {
    await gotoSettled(page, "/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCount(0);
    await openCommandMenu(page);
    await expect(page.getByRole("combobox")).toBeFocused();
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("typing filters and Enter navigates to the result", async ({ page }) => {
    await gotoSettled(page, "/");
    await openCommandMenu(page);
    await page.getByRole("option").first().waitFor();

    await page.getByRole("combobox").fill("lipi");
    await expect(page.getByRole("option").first()).toContainText("Lipi");
    await page.keyboard.press("Enter");

    await page.waitForURL(/\/projects[/#]lipi$/, { timeout: 10_000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the Search button opens it too", async ({ page }) => {
    await gotoSettled(page, "/");
    await openWith(
      visible(page.getByRole("button", { name: "Search", exact: true })),
      page.getByRole("dialog")
    );
    await expect(page.getByRole("combobox")).toBeFocused();
  });

  test("pressing the Search button again closes it", async ({ page }) => {
    await gotoSettled(page, "/");
    const search = visible(
      page.getByRole("button", { name: "Search", exact: true })
    );
    const dialog = page.getByRole("dialog");
    await openThenToggleShut(page, search, dialog);
    await expect(search).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Customize", () => {
  test("it opens, sets the dark theme, and the choice is saved", async ({
    page,
  }, testInfo) => {
    const edition = editionFromTestInfo(testInfo);
    const { customize } = shapeFor(edition);
    test.skip(customize === null, "this edition has no Customize panel");
    if (customize === null) return;

    await gotoSettled(page, "/");
    await expectTheme(page, "light");
    const panel = page.getByRole("dialog", { name: "Customize" });
    await openWith(
      visible(page.getByRole("button", { name: "Customize", exact: true })),
      panel
    );

    const group = panel.getByRole("radiogroup", { name: customize.group });
    // The radios render sr-only inside their labels, so the click lands on
    // the label, as a pointer's would.
    await group.getByText(customize.dark, { exact: true }).click();
    await expect(
      group.getByRole("radio", { name: customize.dark })
    ).toBeChecked();
    await expectTheme(page, "dark");
    expect(await storedPrefs(page, prefsKeyFor(edition))).toMatchObject({
      theme: "dark",
    });

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });
});

test.describe("Customize trigger", () => {
  test("pressing the Customize button again closes it", async ({
    page,
  }, testInfo) => {
    const { customize } = shapeFor(editionFromTestInfo(testInfo));
    test.skip(customize === null, "this edition has no Customize panel");

    await gotoSettled(page, "/");
    const trigger = visible(
      page.getByRole("button", { name: "Customize", exact: true })
    );
    const panel = page.getByRole("dialog", { name: "Customize" });
    await openThenToggleShut(page, trigger, panel);
  });
});

test.describe("theme toggle", () => {
  test("it flips light to dark and back, and the choice survives a reload", async ({
    page,
    isMobile,
  }, testInfo) => {
    const edition = editionFromTestInfo(testInfo);
    const { theme } = shapeFor(edition);
    test.skip(theme === null, "the theme lives in Customize only");
    if (theme === null) return;
    test.skip(
      isMobile && !theme.phone,
      "on phones the header drops the toggle; Customize covers the theme"
    );

    const control = (name: string) =>
      visible(page.getByRole(theme.role, { name, exact: true }));

    await gotoSettled(page, "/");
    await expectTheme(page, "light");
    await clickUntil(control(theme.fromLight), () =>
      expectTheme(page, "dark", 5_000)
    );
    await expect(control(theme.fromDark)).toBeVisible();

    await page.reload();
    await expectTheme(page, "dark");
    expect(await storedPrefs(page, prefsKeyFor(edition))).toMatchObject({
      theme: "dark",
    });

    await clickUntil(control(theme.fromDark), () =>
      expectTheme(page, "light", 5_000)
    );
  });
});
