"use client";

import { usePathname } from "next/navigation";

import { isMirrorSlug, markdownSlug } from "@/lib/markdown/slugs";
import { cn } from "@/lib/utils";

/**
 * "View as markdown" for the current page, hidden where no mirror exists
 * (404s, lab experiments, pagination). A plain <a>: the .md route is not a page.
 */
export function MarkdownLink({ className }: { className?: string }) {
  const slug = markdownSlug(usePathname());
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
