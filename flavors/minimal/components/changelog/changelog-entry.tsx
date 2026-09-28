import { UrlLink } from "@/flavors/minimal/components/ui/url-link";

import { type Update } from "@/lib/data/types";
import {
  formatShortDate,
  isMonthPrecision,
  toDateTime,
  toMonthDateTime,
} from "@/lib/format";

import { CategoryChip } from "./category-chip";

/** One entry: the date stacks above it on phones, then takes a side column. */
export function ChangelogEntry({ entry }: { entry: Update }) {
  return (
    <li className="grid gap-y-1.5 border-t border-hairline py-4 first:border-t-0 first:pt-1 sm:grid-cols-[3.75rem_1fr] sm:gap-x-4 sm:gap-y-0">
      <time
        dateTime={
          isMonthPrecision(entry.date)
            ? toMonthDateTime(entry.date)
            : toDateTime(entry.date)
        }
        className="meta text-subtle tabular-nums sm:pt-[0.4rem]"
      >
        {formatShortDate(entry.date)}
      </time>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{entry.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <CategoryChip category={entry.category} />
          {entry.link && <UrlLink href={entry.link} />}
        </div>
      </div>
    </li>
  );
}
