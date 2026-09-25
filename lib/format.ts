/**
 * Pure date formatting, one style site-wide: "Sep 25, 2026", "Sep 2026",
 * "Sep 2024 – Present".
 *
 * Content dates (`YYYY-MM-DD`, see `IsoDate`) are parsed by hand rather than
 * with `new Date(iso)`, which reads a bare date as UTC midnight and can land
 * on the previous day in the visitor's or build machine's timezone. Month
 * names are fixed English abbreviations so server and client output never
 * differ by ICU version.
 */
import type { IsoDate } from "@/lib/data/types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** `month` is 1-based. */
export type CalendarDate = { year: number; month: number; day: number };

/** A content date, or a `Date` read in local time. */
export type DateInput = IsoDate | Date;

const ISO_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?/;

/** Splits `YYYY-MM-DD` (or `YYYY-MM`) into numbers; throws on anything else. */
export function parseIsoDate(date: IsoDate): CalendarDate {
  const match = ISO_DATE.exec(date);
  const month = Number(match?.[2]);
  if (!match || month < 1 || month > 12) {
    throw new RangeError(`Invalid ISO date: "${date}"`);
  }
  return {
    year: Number(match[1]),
    month,
    day: match[3] ? Number(match[3]) : 1,
  };
}

function toCalendarDate(date: DateInput): CalendarDate {
  if (typeof date === "string") return parseIsoDate(date);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

function monthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

function calendarDateLabel({ year, month, day }: CalendarDate): string {
  return `${monthName(month)} ${day}, ${year}`;
}

/** "Jan 2026". */
export function formatMonthYear(date: DateInput): string {
  const { year, month } = toCalendarDate(date);
  return `${monthName(month)} ${year}`;
}

/** "Sep 25, 2026". */
export function formatDate(date: DateInput): string {
  return calendarDateLabel(toCalendarDate(date));
}

/**
 * "Sep 25, 2026" for an ISO datetime such as `2026-09-25T18:30:00Z`, read in
 * UTC so the server render and every visitor agree. Empty when unparseable.
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return calendarDateLabel({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

/** Whether a content date is known only to the month (stored on the 1st). */
export function isMonthPrecision(date: IsoDate): boolean {
  return parseIsoDate(date).day === 1;
}

/** "Sep 25" within a year, or just "Sep" for a month-precision date. */
export function formatShortDate(date: IsoDate): string {
  const { month, day } = parseIsoDate(date);
  return day === 1 ? monthName(month) : `${monthName(month)} ${day}`;
}

/** Month precision for `<time dateTime>`: "2026-01". */
export function toMonthDateTime(date: DateInput): string {
  const { year, month } = toCalendarDate(date);
  return `${year}-${pad(month)}`;
}

/** Day precision for `<time dateTime>`: "2026-09-25". */
export function toDateTime(date: DateInput): string {
  const { year, month, day } = toCalendarDate(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** "Sep 2024 – Jan 2026", or "Jan 2026 – Present" when `end` is absent. */
export function formatDateRange(start: DateInput, end?: DateInput): string {
  const to = end === undefined ? "Present" : formatMonthYear(end);
  return `${formatMonthYear(start)} – ${to}`;
}

/** "2020 – 2024", or just "2018" when there is no start year or both match. */
export function formatYearRange(
  startYear: number | undefined,
  endYear: number
): string {
  if (startYear === undefined || startYear === endYear) return `${endYear}`;
  return `${startYear} – ${endYear}`;
}

/**
 * Whole months from `start` to `end`, counting both end months, the way
 * resumes and LinkedIn do: Jan to Mar is 3 months. Never less than 1.
 */
function monthsBetween(start: DateInput, end: DateInput): number {
  const from = toCalendarDate(start);
  const to = toCalendarDate(end);
  const months = (to.year - from.year) * 12 + (to.month - from.month) + 1;
  return Math.max(1, months);
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/** "1 yr 4 mos", "2 yrs", "1 mo". */
function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years > 0 ? plural(years, "yr", "yrs") : "",
    rest > 0 ? plural(rest, "mo", "mos") : "",
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Length of a role, e.g. "1 yr 4 mos". Measure an ongoing role to the
 * visitor's `new Date()`, not a build-time one.
 */
export function formatTenure(start: DateInput, end: DateInput): string {
  return formatDuration(monthsBetween(start, end));
}
