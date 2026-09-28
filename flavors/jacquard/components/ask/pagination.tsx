import Link from "next/link";
import { cn } from "@/flavors/jacquard/lib/utils";

import { askPageHref } from "@/lib/ask/format";

const tabClass =
  "inline-flex min-h-11 items-center gap-2 px-4 text-sm leading-none font-medium border border-ink transition-colors fine:hover:bg-ink fine:hover:text-ground";

/** Newer and older pages of the board. Nothing for a single page. */
export function Pagination({
  page,
  pageCount,
  className,
}: {
  page: number;
  pageCount: number;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <div>
        {page > 1 ? (
          <Link href={askPageHref(page - 1)} rel="prev" className={tabClass}>
            ← Newer
          </Link>
        ) : null}
      </div>
      <p className="label">
        Page {page} of {pageCount}
      </p>
      <div>
        {page < pageCount ? (
          <Link href={askPageHref(page + 1)} rel="next" className={tabClass}>
            Older →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
