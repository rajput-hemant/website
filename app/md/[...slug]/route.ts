import { getMarkdownSlugs, renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/url";

// Prerendered at build time like the HTML pages; tag revalidation refreshes both.
export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getMarkdownSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/md/[...slug]">
) {
  const slug = (await params).slug.join("/");
  const markdown = await renderMarkdown(slug);

  if (markdown === null) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const pagePath = slug === "index" ? "/" : `/${slug}`;
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // The HTML page is the canonical document; the mirror is an alternate form of it.
      Link: `<${absoluteUrl(pagePath)}>; rel="canonical"`,
      Vary: "Accept",
    },
  });
}
