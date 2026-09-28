import Link from "next/link";
import { cn } from "@/flavors/surface/lib/utils";

import { askPageHref } from "@/lib/ask/format";

/**
 * Newer and older keys between the static `/ask` list pages, with a bank
 * readout between them. Renders nothing for a single page.
 */
export function AskPagination({
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
        {page > 1 && (
          <Link href={askPageHref(page - 1)} rel="prev" className="key">
            <span aria-hidden>&larr;</span> Newer
          </Link>
        )}
      </div>
      <p className="legend tabular-nums">
        Page {page} of {pageCount}
      </p>
      <div>
        {page < pageCount && (
          <Link href={askPageHref(page + 1)} rel="next" className="key">
            Older <span aria-hidden>&rarr;</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
