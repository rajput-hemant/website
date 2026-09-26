export const ASK_PAGE_SIZE = 20;

export const askPageCount = (total: number) =>
  Math.max(1, Math.ceil(total / ASK_PAGE_SIZE));

/**
 * The page number for a `/ask/page/[page]` segment, or null when the segment is
 * not canonical (`1` lives at `/ask`; `02`, `2.0` and `abc` are not pages).
 */
export function parseAskPage(segment: string): number | null {
  if (!/^[1-9]\d{0,5}$/.test(segment)) return null;
  const page = Number(segment);
  return page >= 2 ? page : null;
}
