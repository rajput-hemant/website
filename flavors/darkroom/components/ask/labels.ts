/** "Sleeve 014": a thread's number in the file of sleeves, counted from the first ever sent. */
export const sleeveLabel = (n: number) =>
  `Sleeve ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
