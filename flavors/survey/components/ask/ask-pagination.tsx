import Link from "next/link";
import { cn } from "@/flavors/survey/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { askPageHref } from "@/lib/ask/format";

const leafClass =
  "group/leaf caps inline-flex min-h-11 items-center gap-2 rounded-sm border border-rule-strong px-4 text-ink transition-colors duration-200 fine:hover:border-water fine:hover:text-water";

/** Newer and older leaves of the static `/ask` notebook. Renders nothing for one leaf. */
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
        "flex items-center justify-between gap-4 border-t border-rule pt-5",
        className
      )}
    >
      <div>
        {page > 1 && (
          <Link href={askPageHref(page - 1)} rel="prev" className={leafClass}>
            <ArrowLeft
              aria-hidden
              strokeWidth={1.75}
              className="size-3 motion:transition-transform motion:duration-(--duration-ui) motion:ease-enter fine:group-hover/leaf:motion:-translate-x-0.5"
            />
            Newer
          </Link>
        )}
      </div>
      <p className="caps text-ink-faint tabular-nums">
        Leaf {page} of {pageCount}
      </p>
      <div>
        {page < pageCount && (
          <Link href={askPageHref(page + 1)} rel="next" className={leafClass}>
            Older
            <ArrowRight
              aria-hidden
              strokeWidth={1.75}
              className="size-3 motion:transition-transform motion:duration-(--duration-ui) motion:ease-enter fine:group-hover/leaf:motion:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
