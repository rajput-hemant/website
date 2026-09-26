import Link from "next/link";
import { cn, route } from "@/flavors/press/lib/utils";

import { askPageHref } from "@/lib/ask/format";

const tabClass =
  "inline-flex min-h-11 items-center gap-2 px-4 text-sm leading-none font-bold shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors fine:hover:bg-ink fine:hover:text-paper";

/** Newer and older sheets of queries. Nothing for a single sheet. */
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
          <Link
            href={route(askPageHref(page - 1))}
            rel="prev"
            className={tabClass}
          >
            ← Newer
          </Link>
        ) : null}
      </div>
      <p className="slug">
        Sheet {page} of {pageCount}
      </p>
      <div>
        {page < pageCount ? (
          <Link
            href={route(askPageHref(page + 1))}
            rel="next"
            className={tabClass}
          >
            Older →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
