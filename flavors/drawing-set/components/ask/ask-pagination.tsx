import Link from "next/link";
import { cn } from "@/flavors/drawing-set/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { askPageHref } from "@/lib/ask/format";

const tabClass =
  "group/page inline-flex min-h-11 items-center gap-1.5 rounded-t-md border border-b-0 border-line-strong bg-sheet px-3 font-mono text-mono-xs tracking-[0.1em] text-ink-soft uppercase transition-colors hover:border-accent/40 hover:text-ink";

/**
 * Newer/older tabs between the static `/ask` list pages, styled as drawer
 * fronts in the tray. Renders nothing for a single page.
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
      className={cn(
        "flex items-end justify-between gap-4 border-b-2 border-line-strong",
        className
      )}
    >
      <div>
        {page > 1 && (
          <Link href={askPageHref(page - 1)} rel="prev" className={tabClass}>
            <ArrowLeft
              aria-hidden
              strokeWidth={1.75}
              className="size-3 transition-transform duration-(--duration-ui) ease-enter group-hover/page:-translate-x-0.5"
            />
            Newer
          </Link>
        )}
      </div>
      <p className="mb-2 font-mono text-mono-xs text-ink-faint tabular-nums">
        Drawer {page} of {pageCount}
      </p>
      <div>
        {page < pageCount && (
          <Link href={askPageHref(page + 1)} rel="next" className={tabClass}>
            Older
            <ArrowRight
              aria-hidden
              strokeWidth={1.75}
              className="size-3 transition-transform duration-(--duration-ui) ease-enter group-hover/page:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
