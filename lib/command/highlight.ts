export type HighlightSegment = { text: string; match: boolean };

/**
 * Splits `text` into runs that do and don't contain a word of `query`
 * (case-insensitive), so a result can show why it matched. cmdk ranks the
 * results; this only marks the literal hits.
 */
export function highlightSegments(
  text: string,
  query: string
): HighlightSegment[] {
  const lower = text.toLowerCase();
  const marked = new Array<boolean>(text.length).fill(false);

  for (const token of query.toLowerCase().split(/\s+/).filter(Boolean)) {
    for (
      let at = lower.indexOf(token);
      at !== -1;
      at = lower.indexOf(token, at + 1)
    ) {
      marked.fill(true, at, at + token.length);
    }
  }

  const segments: HighlightSegment[] = [];
  for (let i = 0; i < text.length; i++) {
    const match = marked[i] ?? false;
    const last = segments.at(-1);
    if (last?.match === match) last.text += text.charAt(i);
    else segments.push({ text: text.charAt(i), match });
  }
  return segments;
}
