"use client";

import { cn } from "@/flavors/minimal/lib/utils";

import { isMirrorSlug, markdownSlug } from "@/lib/markdown/slugs";
import { usePublicPathname } from "@/lib/public-pathname";

/**
 * "View as markdown" for the current page, hidden where no mirror exists
 * (404s, lab experiments, pagination). A plain <a>: the .md route is not a page.
 */
export function MarkdownLink({ className }: { className?: string }) {
  const slug = markdownSlug(usePublicPathname());
  if (!isMirrorSlug(slug)) return null;

  return (
    <a
      href={`/${slug}.md`}
      className={cn("transition-colors hover:text-foreground", className)}
    >
      View as markdown
    </a>
  );
}
