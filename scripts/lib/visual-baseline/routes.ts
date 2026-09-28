import { readFileSync } from "node:fs";
import { join } from "node:path";

import { liveFlavors, type LiveFlavorId } from "@/flavors/registry";

type PrerenderManifest = {
  routes: Record<string, unknown>;
};

export type EditionRoute = {
  flavor: LiveFlavorId;
  /** Path within the edition, e.g. `/work` or `/projects/foo`. */
  path: string;
  /** Full prerendered path, e.g. `/f/minimal/work`. */
  urlPath: string;
};

export function readPrerenderManifest(nextDir: string): PrerenderManifest {
  const raw = readFileSync(join(nextDir, "prerender-manifest.json"), "utf8");
  return JSON.parse(raw) as PrerenderManifest;
}

/** Every static HTML route under `/f/<liveFlavor>/…` from the build manifest. */
export function editionRoutesFromManifest(nextDir: string): EditionRoute[] {
  const manifest = readPrerenderManifest(nextDir);
  const built = Object.keys(manifest.routes).sort();
  const routes: EditionRoute[] = [];

  for (const flavor of liveFlavors) {
    const prefix = `/f/${flavor}`;
    for (const urlPath of built) {
      if (urlPath !== prefix && !urlPath.startsWith(`${prefix}/`)) continue;
      const path =
        urlPath === prefix ? "/" : urlPath.slice(prefix.length) || "/";
      routes.push({ flavor, path, urlPath });
    }
  }

  return routes.sort((a, b) =>
    a.flavor === b.flavor
      ? a.urlPath.localeCompare(b.urlPath)
      : a.flavor.localeCompare(b.flavor)
  );
}

export function screenCount(routeCount: number): number {
  return routeCount * 2 * 3;
}
