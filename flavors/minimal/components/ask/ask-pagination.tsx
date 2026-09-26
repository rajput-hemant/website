import Link from "next/link";
import { cn } from "@/flavors/minimal/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { askPageHref } from "@/lib/ask/format";

const linkClass =
  "group/page inline-flex items-center gap-1.5 meta text-muted transition-colors hover:text-foreground";

/** Newer/older links between the static `/ask` list pages. Renders nothing for a single page. */
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
      className={cn("grid grid-cols-3 items-center gap-4", className)}
    >
      <div>
        {page > 1 && (
          <Link href={askPageHref(page - 1)} rel="prev" className={linkClass}>
            <ArrowLeft
              aria-hidden
              strokeWidth={1.75}
              className="size-3 transition-transform duration-(--duration-enter) ease-enter group-hover/page:-translate-x-0.5"
            />
            Newer
          </Link>
        )}
      </div>
      <p className="text-center meta text-subtle tabular-nums">
        Page {page} of {pageCount}
      </p>
      <div className="text-right">
        {page < pageCount && (
          <Link href={askPageHref(page + 1)} rel="next" className={linkClass}>
            Older
            <ArrowRight
              aria-hidden
              strokeWidth={1.75}
              className="size-3 transition-transform duration-(--duration-enter) ease-enter group-hover/page:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
