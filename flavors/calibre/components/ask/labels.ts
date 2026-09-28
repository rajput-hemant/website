/** "Request 014": a thread's number in the request book, counted from the first ever sent. */
export const requestLabel = (n: number) =>
  `Request ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
