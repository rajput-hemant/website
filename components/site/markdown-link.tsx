"use client";

import { usePathname } from "next/navigation";

import { isMirrorSlug, markdownSlug } from "@/lib/markdown/slugs";
import { cn } from "@/lib/utils";

export function markdownPath(pathname: string) {
  return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

/**
 * "View as markdown" for the current page, hidden where no mirror exists
 * (404s, lab experiments, pagination). A plain <a>: the .md route is not a page.
 */
export function MarkdownLink({ className }: { className?: string }) {
  const pathname = usePathname();
  if (!isMirrorSlug(markdownSlug(pathname))) return null;

  return (
    <a
      href={markdownPath(pathname)}
      className={cn("transition-colors hover:text-foreground", className)}
    >
      View as markdown
    </a>
  );
}
