import Link from "next/link";
import { cn } from "@/flavors/timetable/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { askPageHref } from "@/lib/ask/format";

const tabClass =
  "group/page inline-flex min-h-11 items-center gap-2 rounded-md px-4 pt-0.5 text-[0.9375rem] leading-none font-bold text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] transition-colors fine:hover:bg-ink fine:hover:text-ground";

/**
 * Newer/older tabs between the static `/ask` list pages, styled as drawer
 * pages of notices. Renders nothing for a single page.
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
        "flex items-end justify-between gap-4 border-b-2 border-rule-strong",
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
