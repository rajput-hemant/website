/** "Notice 014": a thread's number on the information desk, counted from the first ever posted. */
export const noticeLabel = (n: number) =>
  `Notice ${String(Math.max(1, n)).padStart(3, "0")}`;
