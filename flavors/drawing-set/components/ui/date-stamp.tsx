import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import type { IsoDate } from "@/lib/data/types";
import { parseIsoDate, toDateTime, toMonthDateTime } from "@/lib/format";

export type DateStampProps = {
  date: IsoDate;
  precision?: "month" | "day";
  className?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

/** Mono, tabular `<time>`: "2026.09" or "2026.09.26". */
export function DateStamp({
  date,
  precision = "month",
  className,
}: DateStampProps) {
  const { year, month, day } = parseIsoDate(date);
  const label =
    precision === "day"
      ? `${year}.${pad(month)}.${pad(day)}`
      : `${year}.${pad(month)}`;
  const dateTime =
    precision === "day" ? toDateTime(date) : toMonthDateTime(date);

  return (
    <time
      dateTime={dateTime}
      className={cn(
        "font-mono text-mono-xs tracking-[0.08em] text-ink-soft tabular-nums",
        className
      )}
    >
      {label}
    </time>
  );
}
