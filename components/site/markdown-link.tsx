"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function markdownPath(pathname: string) {
  return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

/** "View as markdown" for the current page. A plain <a>: the .md route is not a page. */
export function MarkdownLink({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <a
      href={markdownPath(pathname)}
      className={cn("transition-colors hover:text-foreground", className)}
    >
      View as markdown
    </a>
  );
}
