import type { Now } from "@/lib/data/types";

/** Longest item, in characters, that still reads well in half the column. */
export const SHORT_ITEM_MAX = 60;
/** Fewer items than this read better as one list than as two short columns. */
export const TWO_COLUMN_MIN_ITEMS = 4;

/**
 * Whether the /now list splits into two ruled columns from tablet width:
 * only when there are enough items and every one is short, so no sentence
 * is squeezed into half the measure.
 */
export function fitsTwoColumns(items: Now["items"]): boolean {
  return (
    items.length >= TWO_COLUMN_MIN_ITEMS &&
    items.every((item) => item.text.length <= SHORT_ITEM_MAX)
  );
}
