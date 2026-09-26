import { NextResponse, type NextRequest } from "next/server";

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
 * Serves each page's markdown mirror from the statically generated
 * `app/md/[...slug]` route: `/<page>.md` always, and the page URL itself when
 * the request prefers `text/markdown`. The matcher keeps this off every other
 * request, so HTML pages stay static and the proxy never runs for them.
 *
 * Slugs that cannot name a mirror are answered here, so the mirror route never
 * renders (and caches) arbitrary paths.
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
  return prefersMarkdown(request) && isMirrorSlug(slug)
    ? rewriteToMirror(request, slug)
    : NextResponse.next();
}

function rewriteToMirror(request: NextRequest, slug: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/md/${slug}`;
  return NextResponse.rewrite(url);
}

// Matchers must be literals, so the negotiated paths are spelled out: `pages`
// in content/site.ts plus /ask/<slug> permalinks.
export const config = {
  matcher: [
    "/:path+.md",
    "/md/:path*",
    {
      source: "/",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
    {
      source: "/(work|projects|now|about|resume|ask|lab)",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
    {
      source: "/ask/:slug",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
  ],
};
