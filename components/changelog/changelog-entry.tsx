import { type Update } from "@/lib/data/types";
import {
  formatShortDate,
  isMonthPrecision,
  toDateTime,
  toMonthDateTime,
} from "@/lib/format";
import { UrlLink } from "@/components/ui/url-link";

import { CategoryChip } from "./category-chip";

export function ChangelogEntry({ entry }: { entry: Update }) {
  return (
    <li className="grid grid-cols-[3.75rem_1fr] gap-x-4 border-b border-border/60 py-5 last:border-b-0">
      <time
        dateTime={
          isMonthPrecision(entry.date)
            ? toMonthDateTime(entry.date)
            : toDateTime(entry.date)
        }
        className="pt-[0.4rem] meta text-subtle tabular-nums"
      >
        {formatShortDate(entry.date)}
      </time>
      <div className="min-w-0">
        <p className="text-foreground">{entry.text}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <CategoryChip category={entry.category} />
          {entry.link && <UrlLink href={entry.link} />}
        </div>
      </div>
    </li>
  );
}
