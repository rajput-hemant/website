import { NextResponse, type NextRequest } from "next/server";
import { FLAVOR_COOKIE } from "@/flavors/registry";

import { routeFlavor } from "@/lib/flavor-routing";
import { isMirrorSlug, markdownSlug } from "@/lib/markdown/slugs";

const MARKDOWN_SUFFIX = /\.md$/;
const MIRROR_ROUTE = /^\/md\//;

/** The q-value the Accept header gives `type` (0 when absent), ignoring wildcards. */
function quality(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [mediaType = "", ...params] = part.trim().split(";");
    if (mediaType.trim().toLowerCase() !== type) continue;
    const q = params
      .map((param) => param.trim().split("="))
      .find(([name]) => name === "q")?.[1];
    return q === undefined ? 1 : Number(q) || 0;
  }
  return 0;
}

/** True when the client asks for markdown at least as strongly as for HTML. */
function prefersMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  const markdown = quality(accept, "text/markdown");
  return markdown > 0 && markdown >= quality(accept, "text/html");
}

const notFound = () =>
  new NextResponse("Not found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

/**
 * Two jobs, in order:
 * 1. Markdown mirrors from the static `app/md/[...slug]` route: `/<page>.md`
 *    always, and the page URL itself when the request prefers
 *    `text/markdown`. Slugs that cannot name a mirror are answered here, so
 *    the mirror route never renders (and caches) arbitrary paths.
 * 2. Editions: every other page request is rewritten to the visitor's
 *    edition (see `routeFlavor`). The targets are static pages, so reading
 *    the cookie here keeps them static.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MIRROR_ROUTE.test(pathname)) {
    return isMirrorSlug(pathname.replace(MIRROR_ROUTE, ""))
      ? NextResponse.next()
      : notFound();
  }

  const slug = markdownSlug(pathname.replace(MARKDOWN_SUFFIX, ""));
  if (MARKDOWN_SUFFIX.test(pathname)) {
    return isMirrorSlug(slug) ? rewriteToMirror(request, slug) : notFound();
  }
  if (prefersMarkdown(request) && isMirrorSlug(slug)) {
    return rewriteToMirror(request, slug);
  }
  return routeToFlavor(request);
}

const YEAR_SECONDS = 60 * 60 * 24 * 365;

function routeToFlavor(request: NextRequest) {
  const route = routeFlavor({
    pathname: request.nextUrl.pathname,
    searchParams: request.nextUrl.searchParams,
    cookie: request.cookies.get(FLAVOR_COOKIE)?.value,
  });
  if (route.type === "next") return NextResponse.next();

  const url = request.nextUrl.clone();
  const [pathname, search = ""] = route.to.split("?");
  url.pathname = pathname ?? "/";
  url.search = search;
  if (route.type === "rewrite") return NextResponse.rewrite(url);

  const response = NextResponse.redirect(url, 307);
  // A preference, not a secret: readable by the page, sent on navigations.
  response.cookies.set(FLAVOR_COOKIE, route.flavor, {
    path: "/",
    maxAge: YEAR_SECONDS,
    sameSite: "lax",
  });
  return response;
}

function rewriteToMirror(request: NextRequest, slug: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/md/${slug}`;
  return NextResponse.rewrite(url);
}

// Matchers must be literals. Pages are everything without a file extension
// outside the framework, API, studio and root metadata routes.
export const config = {
  matcher: [
    "/:path+.md",
    "/md/:path*",
    "/((?!_next/|api/|studio|icon|apple-icon|opengraph-image|twitter-image|[^?]*\\.).*)",
  ],
};
