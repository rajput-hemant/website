import { usePathname } from "next/navigation";

const EDITION_PREFIX = /^\/f\/[^/]+(?=\/|$)/;

/** `/f/<edition>/work` is the public `/work`: the proxy rewrites one to the other. */
export function publicPath(pathname: string): string {
  return pathname.replace(EDITION_PREFIX, "") || "/";
}

/**
 * The URL the visitor sees. `usePathname` returns the internal edition path
 * while a static page renders and the public one in the browser, which would
 * make every path-dependent render mismatch on hydration.
 */
export function usePublicPathname(): string {
  return publicPath(usePathname());
}
