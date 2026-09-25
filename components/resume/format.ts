const monthYearFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `2026-01-01` → `Jan 2026`. */
export function monthYear(isoDate: string) {
  return monthYearFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

/** `2020 – 2024`, or just `2020` for a single year. */
export function yearSpan(start: number | undefined, end: number) {
  return start && start !== end ? `${start} – ${end}` : String(end);
}
