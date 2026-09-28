/** "Card 014": a thread's number among the comment cards, counted from the first ever sent. */
export const sleeveLabel = (n: number) =>
  `Card ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
