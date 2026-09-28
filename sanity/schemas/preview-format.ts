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

/** Preview `select` values arrive untyped; keeps strings only. */
export function selectedString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** A preview `title` from an untyped `select` value, omitted unless it is a string. */
export function previewTitle(value: unknown): { title?: string } {
  return typeof value === "string" ? { title: value } : {};
}
