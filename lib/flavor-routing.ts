/** Where the edition picker lives; `/` rewrites to it until a visitor picks. */
export const PICKER_PATH = "/flavors";

export type FlavorRoute<F extends string = string> =
  /** `flavor`, when present, is the edition to remember in the cookie. */
  | { type: "redirect"; to: string; flavor?: F }
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
export function routeFlavor<F extends string>(
  {
    pathname,
    searchParams,
    cookie,
  }: {
    pathname: string;
    searchParams: URLSearchParams;
    cookie: string | undefined;
  },
  options: {
    defaultFlavor: F;
    isLiveFlavor: (value: unknown) => value is F;
    /** The deploy's one edition (`NEXT_PUBLIC_FLAVOR`); cookie and query are then ignored. */
    pinnedFlavor?: F | undefined;
  }
): FlavorRoute<F> {
  if (options.pinnedFlavor !== undefined) {
    return routePinned(pathname, searchParams, options.pinnedFlavor);
  }

  const requested = searchParams.get("flavor");
  if (options.isLiveFlavor(requested)) {
    const rest = new URLSearchParams(searchParams);
    rest.delete("flavor");
    const query = rest.size ? `?${rest}` : "";
    return { type: "redirect", to: `${pathname}${query}`, flavor: requested };
  }

  if (pathname === PICKER_PATH || pathname.startsWith("/f/")) {
    return { type: "next" };
  }

  const chosen = options.isLiveFlavor(cookie) ? cookie : null;
  if (pathname === "/" && !chosen) return { type: "rewrite", to: PICKER_PATH };

  const flavor = chosen ?? options.defaultFlavor;
  return {
    type: "rewrite",
    to: `/f/${flavor}${pathname === "/" ? "" : pathname}`,
  };
}

const EDITION_PATH = /^\/f\/([^/]+)(\/.*)?$/;

/**
 * A pinned deploy has one edition and no picker. The picker path gets that
 * edition's 404 (its `[...missing]` catch-all), and another edition's tree
 * redirects to the same page under the clean URL, so old `/f/<id>/...` links
 * still land somewhere real. The redirect is temporary (307): the pin is a
 * deploy setting that may change.
 */
function routePinned<F extends string>(
  pathname: string,
  searchParams: URLSearchParams,
  pinned: F
): FlavorRoute<F> {
  const edition = EDITION_PATH.exec(pathname);
  if (edition) {
    if (edition[1] === pinned) return { type: "next" };
    const query = searchParams.size ? `?${searchParams}` : "";
    return { type: "redirect", to: `${edition[2] ?? "/"}${query}` };
  }
  return {
    type: "rewrite",
    to: `/f/${pinned}${pathname === "/" ? "" : pathname}`,
  };
}
