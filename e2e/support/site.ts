import { expect, type Page } from "@playwright/test";

import { labExperiments } from "@/content/lab";
import { nav, pages } from "@/content/site";
import { defaultPrefs, PREFS_KEY, type Prefs } from "@/lib/prefs";

export { nav, pages, labExperiments, defaultPrefs, PREFS_KEY, type Prefs };

/** Every public HTML page: the mirrored pages plus each lab experiment. */
export const publicPaths: readonly string[] = [
  ...pages.map((page) => page.path),
  ...labExperiments.map((experiment) => `/lab/${experiment.slug}`),
];

/** `/` mirrors to `/index.md`, everything else to `/<path>.md`. */
export const markdownPathFor = (path: string) =>
  path === "/" ? "/index.md" : `${path}.md`;

/**
 * The cursor follower is two aria-hidden layers styled by a CSS module, so the
 * hashed class is matched by its module-local name.
 */
export const cursorLayer = (page: Page) =>
  page.locator(
    '[data-cursor-layer], body > [aria-hidden="true"][class*="cursor"]'
  );

/** Loads a page and waits until the client has settled (hydrated, idle network). */
export async function gotoSettled(page: Page, path: string) {
  const response = await page.goto(path);
  await page.waitForLoadState("networkidle");
  return response;
}

export const html = (page: Page) => page.locator("html");

export async function storedPrefs(page: Page): Promise<Partial<Prefs> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : null;
  }, PREFS_KEY);
}

/** Opens the Customize popover, retrying the click until hydration has wired it up. */
export async function openCustomize(page: Page) {
  const trigger = page.getByRole("button", { name: "Customize" });
  const panel = page.getByRole("dialog", { name: "Customize" });
  await expect(async () => {
    if (!(await panel.isVisible())) await trigger.click();
    await expect(panel).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  return panel;
}
