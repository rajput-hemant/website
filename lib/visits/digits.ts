/** One cell of the rolling counter: a digit strip or a fixed separator. */
export type CounterGlyph =
  | { kind: "digit"; digit: number; key: string }
  | { kind: "literal"; char: string; key: string };

/** Deterministic grouping so server logs, tests and every visitor agree. */
export const visitorNumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/**
 * Splits the formatted number into glyphs keyed by their position from the
 * right, so when the count grows from 999 to 1,000 the existing ones, tens and
 * hundreds strips keep their identity and roll instead of remounting.
 */
export function toCounterGlyphs(
  value: number,
  format: Intl.NumberFormat = visitorNumberFormat
): CounterGlyph[] {
  const chars = Array.from(format.format(value));
  return chars.map((char, index) => {
    const key = `p${chars.length - 1 - index}`;
    return /^[0-9]$/.test(char)
      ? { kind: "digit", digit: Number(char), key }
      : { kind: "literal", char, key };
  });
}

/** The strip's offset: digit `n` sits `n` rows down a 0-9 column. */
export function digitOffset(digit: number): string {
  return digit === 0 ? "translateY(0)" : `translateY(-${digit}em)`;
}
