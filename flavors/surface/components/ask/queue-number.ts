/**
 * Queue numbers for threads, like a ticket from a counter. The newest thread
 * ever filed carries the highest number, so a number never changes as later
 * ones arrive.
 */
export function queueLabel(n: number): string {
  return `Q ${String(Math.max(n, 0)).padStart(3, "0")}`;
}
