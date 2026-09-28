const monthFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Jan 2026 - Present" style range for Studio list previews. */
export function formatMonthRange(start?: string, end?: string): string {
  const format = (date?: string) =>
    date ? monthFormat.format(new Date(date)) : undefined;
  return [format(start) ?? "?", format(end) ?? "Present"].join(" - ");
}
