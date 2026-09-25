/** Case- and whitespace-insensitive form of a name, for matching records that differ only in typing. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
