/** The first `max` characters of a message on one line, cut at a word boundary. */
export function excerpt(text: string, max = 60): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[\s.,;:!?-]+$/, "")}…`;
}

export const askPageHref = (page: number) =>
  page <= 1 ? "/ask" : `/ask/page/${page}`;

export const askEntryHref = (slug: string) => `/ask/${slug}`;

/** How a visitor is named when they left no name. */
export const visitorName = (authorName?: string) => authorName ?? "Anonymous";
