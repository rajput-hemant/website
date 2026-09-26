/** "Entry 014": a thread's number in the field notebook, counted from the first ever made. */
export const entryLabel = (n: number) =>
  `Entry ${String(Math.max(1, n)).padStart(3, "0")}`;
