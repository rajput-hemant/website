/** "TX 014": a transmission's number on the capcom loop, counted from the first ever approved. */
export const sampleLabel = (n: number) =>
  `TX ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
