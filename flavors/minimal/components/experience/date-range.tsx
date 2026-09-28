import type { IsoDate } from "@/lib/data/types";
import { formatMonthYear, toMonthDateTime } from "@/lib/format";

export type DateRangeProps = {
  start: IsoDate;
  /** Absent means the role is ongoing. */
  end?: IsoDate;
  className?: string;
};

/** "Sep 2024 – Jan 2026" or "Jan 2026 – Present", with machine-readable months. */
export function DateRange({ start, end, className }: DateRangeProps) {
  return (
    <span className={className}>
      <time dateTime={toMonthDateTime(start)}>{formatMonthYear(start)}</time>
      {" – "}
      {end ? (
        <time dateTime={toMonthDateTime(end)}>{formatMonthYear(end)}</time>
      ) : (
        "Present"
      )}
    </span>
  );
}
