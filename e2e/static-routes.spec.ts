import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { liveFlavors } from "@/flavors/registry";
import { expect, test } from "@playwright/test";

import { markdownPathFor, pages, publicPaths } from "./support/site";

/**
 * Reads what `next build` wrote. A route in `prerender-manifest.json` `routes`
 * was rendered at build time (○ / ●); a dynamic segment listed under
 * `dynamicRoutes` is ISR (●). A route in neither is rendered per request (ƒ).
 */
type PrerenderManifest = {
  routes: Record<string, { initialRevalidateSeconds: number | false }>;
  dynamicRoutes: Record<string, unknown>;
};

const nextDir = fileURLToPath(new URL("../.next/", import.meta.url));

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(`${nextDir}${name}`, "utf8")) as T;
}

/** App routes that are not public pages: request-time by design. */
const NON_PUBLIC = [
  /^\/api\//,
  /^\/studio/,
  /^\/_global-error$/,
  /^\/_global-not-found$/,
  // Each edition's 404 for paths it doesn't have.
  /\/\[\.\.\.missing\]$/,
];

/** Every edition serves every public path from its own static tree. */
const editionPaths = liveFlavors.flatMap((flavor) =>
  publicPaths.map((path) => `/f/${flavor}${path === "/" ? "" : path}`)
);

test.describe("build output", () => {
  const manifest = readJson<PrerenderManifest>("prerender-manifest.json");
  const appRoutes = Object.values(
    readJson<Record<string, string>>("app-path-routes-manifest.json")
  );

  const metadataRoutes = ["/sitemap.xml", "/robots.txt", "/llms.txt"];
  const mirrorRoutes = pages.map(
    (page) => `/md${markdownPathFor(page.path).replace(/\.md$/, "")}`
  );

  for (const path of [
    "/flavors",
    ...editionPaths,
    ...metadataRoutes,
    ...mirrorRoutes,
  ]) {
    test(`${path} is prerendered with no time-based revalidation`, () => {
      const route = manifest.routes[path];
      expect(
        route,
        `${path} missing from prerender-manifest routes`
      ).toBeDefined();
      // Freshness comes from revalidateTag only (brief override 2).
      expect(route?.initialRevalidateSeconds).toBe(false);
    });
  }

  test("no public app route is rendered per request", () => {
    const perRequest = appRoutes.filter(
      (route) =>
        !NON_PUBLIC.some((pattern) => pattern.test(route)) &&
        !(route in manifest.routes) &&
        !(route in manifest.dynamicRoutes)
    );
    expect(perRequest).toEqual([]);
  });
});
