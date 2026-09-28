/** "Query 014": a thread's number on the corrections sheet, counted from the first ever sent. */
export const queryLabel = (n: number) =>
  `Query ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
