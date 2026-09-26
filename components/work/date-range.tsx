import type { IsoDate } from "@/lib/data/types";
import { DateStamp } from "@/components/ui";

export type DateRangeProps = {
  start: IsoDate;
  /** Absent means the role is ongoing. */
  end?: IsoDate;
  className?: string;
};

/** "Sep 2024 – Jan 2026" or "Sep 2024 – Present", month precision. */
export function DateRange({ start, end, className }: DateRangeProps) {
  return (
    <span className={className}>
      <DateStamp date={start} precision="month" />
      {" – "}
      {end ? <DateStamp date={end} precision="month" /> : "Present"}
    </span>
  );
}
