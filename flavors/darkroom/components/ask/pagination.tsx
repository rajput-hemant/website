import Link from "next/link";
import { cn } from "@/flavors/darkroom/lib/utils";

import { askPageHref } from "@/lib/ask/format";

const tabClass =
  "inline-flex min-h-11 items-center gap-2 rounded-[3px] px-4 text-sm leading-none font-bold shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors fine:hover:bg-ink fine:hover:text-ground";

/** Newer and older boxes of sleeves. Nothing for a single box. */
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
      <p className="edge">
        Box {page} of {pageCount}
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
