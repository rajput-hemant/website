import type { Route } from "next";

/** A same-site absolute path: starts with one slash, never `//` (protocol-relative). */
function isPublicPath(path: string): path is Route {
  return path.startsWith("/") && !path.startsWith("//");
}

/**
 * A public path as a typed route. Public URLs are served by the proxy's
 * rewrite into an edition's tree (`/projects` is `/f/<id>/projects`), so
 * typedRoutes never lists them; this is the one place they become `Route`,
 * checked at runtime instead of cast. Throws on anything that is not a
 * same-site path, which would otherwise navigate off the site.
 */
export function route(path: string): Route {
  if (!isPublicPath(path)) {
    throw new TypeError(`Not a same-site path: "${path}"`);
  }
  return path;
}
