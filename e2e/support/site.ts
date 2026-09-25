import { expect, type Locator, type Page } from "@playwright/test";

import { labExperiments } from "@/content/lab";
import { nav, pages } from "@/content/site";
import {
  defaultPrefs,
  PREFS_KEY,
  PREFS_VERSION,
  type Prefs,
} from "@/lib/prefs";

export {
  nav,
  pages,
  labExperiments,
  defaultPrefs,
  PREFS_KEY,
  PREFS_VERSION,
  type Prefs,
};

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

/**
 * Loads a page and waits until the client has settled (hydrated, idle
 * network).
 *
 * Bounded, not indefinite: the visitor counter's request to `/api/visits`
 * never resolves to Chromium's satisfaction when it 503s (which it always
 * does without Sanity configured) — see the real product bug filed against
 * `components/visitor-counter/use-visitor-count.ts` in the test report. That
 * leaves `networkidle` unreachable on every single page, so waiting for it
 * without a bound would hang every test that calls this for the full test
 * timeout. A page that has otherwise settled must not fail on that account.
 */
export async function gotoSettled(page: Page, path: string) {
  const response = await page.goto(path);
  await waitForNetworkIdleBounded(page);
  return response;
}

/**
 * A bounded stand-in for `page.waitForLoadState("networkidle")` (see
 * `gotoSettled`'s comment for why an unbounded wait hangs). Used after a
 * `page.reload()` or a client navigation elsewhere in the suite, for the
 * same reason.
 */
export async function waitForNetworkIdleBounded(page: Page) {
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => undefined);
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

/** Opens the Customize panel's "Effects" disclosure (link previews, cursor, smooth scroll, sound, texture). */
export async function openEffects(panel: Locator) {
  const label = panel.getByText("Effects", { exact: true });
  // `.filter({ has: label })` unexpectedly matches nothing here; walking up
  // from the label to its nearest <details> ancestor is more direct anyway.
  const content = label.locator("xpath=ancestor::details[1]");
  // Click the whole summary bar, not just the label span inside it: native
  // <details>/<summary> toggling needs the click to land on the summary.
  const summary = content.locator(":scope > summary");
  await expect(async () => {
    if (!(await content.evaluate((el) => (el as HTMLDetailsElement).open))) {
      await summary.click();
    }
    await expect(content).toHaveJSProperty("open", true, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  return panel;
}
