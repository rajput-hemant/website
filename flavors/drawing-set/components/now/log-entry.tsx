import { DateStamp, Tag } from "@/flavors/drawing-set/components/ui";

import { updateCategoryLabels } from "@/lib/data/labels";
import { isMonthPrecision } from "@/lib/format";

import { ItemLink } from "./item-link";
import type { RevisionEntry } from "./types";

/** One changelog entry as a revision-table row: REV, DATE, DESCRIPTION, CATEGORY. */
export function revisionRow(entry: RevisionEntry) {
  return {
    rev: String(entry.rev).padStart(2, "0"),
    date: (
      <DateStamp
        date={entry.date}
        precision={isMonthPrecision(entry.date) ? "month" : "day"}
      />
    ),
    description: (
      <span className="normal-case">
        {entry.text}
        {entry.link && (
          <span className="mt-1 block text-sm">
            <ItemLink href={entry.link} />
          </span>
        )}
      </span>
    ),
    category: <Tag>{updateCategoryLabels[entry.category]}</Tag>,
  };
}
