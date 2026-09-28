import { isLiveFlavor, type LiveFlavorId } from "@/flavors/registry";
import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";

import { labExperiments } from "@/content/lab";
import { pages } from "@/content/site";

export { pages, labExperiments };

/** The editions the Playwright projects cover: every live one. */
export type EditionId = LiveFlavorId;

/**
 * The edition a project runs, from its `<device>-<edition>` name:
 * `desktop-darkroom` runs Darkroom, while plain `desktop` and `mobile` run
 * Minimal.
 */
export function editionFromProjectName(projectName: string): EditionId {
  const suffix = projectName.replace(/^(desktop|mobile)-?/, "");
  return isLiveFlavor(suffix) ? suffix : "minimal";
}

export function editionFromTestInfo(testInfo: TestInfo): EditionId {
  return editionFromProjectName(testInfo.project.name);
}

/** Each edition keeps its prefs under its own localStorage key. */
const prefsKeys: Record<EditionId, string> = {
  minimal: "hr.prefs",
  "drawing-set": "hr.ds.prefs",
  surface: "hr.cs.prefs",
  timetable: "hr.tt.prefs",
  survey: "hr.sv.prefs",
  press: "hr.pp.prefs",
  darkroom: "hr.dr.prefs",
  jacquard: "hr.jq.prefs",
  maquette: "hr.mq.prefs",
  mission: "hr.fp.prefs",
  calibre: "hr.cb.prefs",
};

/** The localStorage prefs key per edition: `hr.prefs` for Minimal, `hr.ds.prefs` for Drawing Set, and so on. */
export function prefsKeyFor(edition: EditionId): string {
  return prefsKeys[edition];
}

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
 * does without Sanity configured): see the real product bug filed against
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

/**
 * Waits until no finite animation or transition is running, twice in a row
 * a beat apart, so a check reads the settled page and not a fade midway
 * (Darkroom's frames, for one, hide below-the-fold tags after idle). Endless
 * loops are ignored; they never settle.
 */
export async function waitForAnimationsSettled(page: Page) {
  const running = () =>
    page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === "running" &&
              Number.isFinite(animation.effect?.getComputedTiming().endTime)
          ).length
    );
  await expect
    .poll(async () => (await running()) + (await sleepThen(page, running)), {
      timeout: 10_000,
    })
    .toBe(0);
}

async function sleepThen(page: Page, read: () => Promise<number>) {
  await page.waitForTimeout(300);
  return read();
}

export const html = (page: Page) => page.locator("html");

export async function storedPrefs(
  page: Page,
  prefsKey: string
): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, prefsKey);
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
