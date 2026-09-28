/**
 * Pure tenure maths, shared by /work's chain dimension and the home page's
 * experience summary. Kept separate from `lib/format`'s prose-style
 * durations ("1 yr 4 mos"): this file feeds dimension labels and pixel
 * scales, which want a plain `{ years, months }` and the terse "2Y 4M" mono
 * form instead.
 */
import type { IsoDate } from "@/lib/data/types";
import { parseIsoDate, type DateInput } from "@/lib/format";

export type Tenure = { years: number; months: number };

function toCalendarDate(date: DateInput) {
  if (typeof date === "string") return parseIsoDate(date);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/**
 * Whole years and months from `start` to `end`, inclusive of the end month
 * (resume convention: Jan to Mar is 3 months, never 0).
 */
export function tenure(start: DateInput, end: DateInput = new Date()): Tenure {
  const from = toCalendarDate(start);
  const to = toCalendarDate(end);
  const totalMonths = Math.max(
    1,
    (to.year - from.year) * 12 + (to.month - from.month) + 1
  );
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

/** Total whole months a `Tenure` spans. */
export function tenureMonths({ years, months }: Tenure): number {
  return years * 12 + months;
}

/** "2Y 4M", "3Y", "5M": the dimension-label style, for `IsoDate` inputs. */
export function formatTenure(
  start: IsoDate,
  end: DateInput = new Date()
): string {
  const { years, months } = tenure(start, end);
  const parts = [years > 0 ? `${years}Y` : "", months > 0 ? `${months}M` : ""];
  return parts.filter(Boolean).join(" ") || "0M";
}
