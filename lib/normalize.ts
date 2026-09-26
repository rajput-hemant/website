/**
 * Case-, whitespace- and punctuation-insensitive form of a name, for matching
 * records that differ only in typing ("B.Tech, CSE" and "B.Tech CSE" match).
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
