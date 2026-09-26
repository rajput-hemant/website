/** The body of every successful `/api/visits` response. Client-safe. */
export type VisitsResponse = { visitors: number };

export function parseVisitsResponse(value: unknown): VisitsResponse | null {
  if (typeof value !== "object" || value === null) return null;
  const visitors = (value as Record<string, unknown>).visitors;
  return typeof visitors === "number" &&
    Number.isSafeInteger(visitors) &&
    visitors >= 0
    ? { visitors }
    : null;
}
