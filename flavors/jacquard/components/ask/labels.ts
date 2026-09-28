/** "Sample 014": a question's number on the sampler board, counted from the first ever pinned. */
export const sampleLabel = (n: number) =>
  `Sample ${String(Math.max(1, n)).padStart(3, "0")}`;

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
