import { updateCategoryLabels } from "@/lib/data/labels";
import type { Update } from "@/lib/data/types";
import { isMonthPrecision } from "@/lib/format";
import { DateStamp, Tag } from "@/components/ui";

import { ItemLink } from "./item-link";

/** One log entry, drawn as an index card: date, category tag, text, optional link. */
export function LogEntry({ entry }: { entry: Update }) {
  return (
    <li className="border border-hairline bg-ink-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DateStamp
          date={entry.date}
          precision={isMonthPrecision(entry.date) ? "month" : "day"}
        />
        <Tag>{updateCategoryLabels[entry.category]}</Tag>
      </div>
      <p className="mt-2.5 text-paper">{entry.text}</p>
      {entry.link && (
        <p className="mt-2 text-sm text-graphite">
          <ItemLink href={entry.link} />
        </p>
      )}
    </li>
  );
}
