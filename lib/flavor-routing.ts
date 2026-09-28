import {
  DEFAULT_FLAVOR,
  isLiveFlavor,
  type LiveFlavorId,
} from "@/flavors/registry";

/** Where the edition picker lives; `/` rewrites to it until a visitor picks. */
export const PICKER_PATH = "/flavors";

export type FlavorRoute =
  | { type: "redirect"; to: string; flavor: LiveFlavorId }
  | { type: "rewrite"; to: string }
  | { type: "next" };

/**
 * Decides how a page request reaches an edition. Public URLs never name the
 * edition: the proxy rewrites `/<path>` to that edition's static tree at
 * `/f/<flavor>/<path>`. A first visit to `/` (no valid cookie) sees the
 * picker; every other path falls back to the default edition, so deep links
 * and crawlers always get a real page. `?flavor=<id>` sets the edition and
 * redirects to the clean URL, which is also how the picker works without JS.
 */
export function routeFlavor({
  pathname,
  searchParams,
  cookie,
}: {
  pathname: string;
  searchParams: URLSearchParams;
  cookie: string | undefined;
}): FlavorRoute {
  const requested = searchParams.get("flavor");
  if (isLiveFlavor(requested)) {
    const rest = new URLSearchParams(searchParams);
    rest.delete("flavor");
    const query = rest.size ? `?${rest}` : "";
    return { type: "redirect", to: `${pathname}${query}`, flavor: requested };
  }

  if (pathname === PICKER_PATH || pathname.startsWith("/f/")) {
    return { type: "next" };
  }

  const chosen = isLiveFlavor(cookie) ? cookie : null;
  if (pathname === "/" && !chosen) return { type: "rewrite", to: PICKER_PATH };

  const flavor = chosen ?? DEFAULT_FLAVOR;
  return {
    type: "rewrite",
    to: `/f/${flavor}${pathname === "/" ? "" : pathname}`,
  };
}
