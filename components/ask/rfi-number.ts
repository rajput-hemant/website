/**
 * RFI-014 style thread numbers. The newest thread ever filed carries the
 * highest number, so a thread's number never changes as later ones arrive.
 */
export function rfiLabel(n: number): string {
  return `RFI-${String(Math.max(n, 0)).padStart(3, "0")}`;
}
