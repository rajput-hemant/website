import { expect, test, type Page } from "@playwright/test";

import { gotoSettled, waitForNetworkIdleBounded } from "./support/site";

/** A symbol only three.js bundles contain. */
const THREE_MARKER = "WebGLRenderer";

function collectThreeChunks(page: Page) {
  const hits: string[] = [];
  page.on("response", async (response) => {
    if (response.request().resourceType() !== "script") return;
    try {
      if ((await response.text()).includes(THREE_MARKER)) {
        hits.push(response.url());
      }
    } catch {
      // Bodies of redirected or aborted responses are unavailable; they carry no code.
    }
  });
  return hits;
}

test.describe("lab isolation", () => {
  for (const path of ["/", "/work"]) {
    test(`${path} never loads three.js`, async ({ page }) => {
      const hits = collectThreeChunks(page);
      await gotoSettled(page, path);
      // Scroll so in-view prefetching (including the Lab nav link) has run.
      await page.mouse.wheel(0, 4000);
      await waitForNetworkIdleBounded(page);
      expect(hits).toEqual([]);
    });
  }
});

test.describe("/lab/signature-field", () => {
  test("shows the canvas or the static fallback", async ({ page }) => {
    await gotoSettled(page, "/lab/signature-field");
    const stage = page.getByRole("img", { name: /field of particles/ });
    await expect(stage).toBeVisible();
    const canvas = stage.locator("canvas");
    const fallback = stage.getByText("hemant", { exact: true });
    await expect(canvas.or(fallback).first()).toBeVisible();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("renders only the fallback and loads no three.js", async ({
      page,
    }) => {
      const hits = collectThreeChunks(page);
      await gotoSettled(page, "/lab/signature-field");
      const stage = page.getByRole("img", { name: /field of particles/ });
      await expect(stage.getByText("hemant", { exact: true })).toBeVisible();
      await expect(stage.locator("canvas")).toHaveCount(0);
      await expect(page.getByText("Motion paused")).toBeVisible();
      expect(hits).toEqual([]);
    });
  });
});
