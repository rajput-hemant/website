/**
 * Escaping for text that must read literally in CommonMark/GFM. It escapes only
 * what could change the parse, so ordinary prose ("e.g.", "Next.js", "3 - 4",
 * "a -> b") stays readable in the raw file.
 */

// Significant anywhere in a line: code spans, emphasis, links and images,
// autolinks and raw HTML, GFM strikethrough, and the escape character itself.
const INLINE_SPECIAL = /[\\`*[\]<~]/g;

// `_` opens or closes emphasis only at a word boundary; snake_case is literal.
const BOUNDARY_UNDERSCORE = /(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu;

// Character references would be decoded: "&amp;" must stay five characters.
const ENTITY_LIKE = /&(?=#?[a-z0-9]+;)/gi;

// Constructs that only exist at the start of a line. Leading whitespace is
// dropped first: it is invisible in rendered prose and, four spaces deep,
// would start an indented code block.
const LINE_START_RULES: readonly [RegExp, string][] = [
  [/^[ \t]+/, ""],
  [/^(#{1,6})(?=\s|$)/, "\\$1"], // ATX heading
  [/^>/, "\\>"], // block quote
  [/^([-+])(?=\s|$)/, "\\$1"], // bullet list item
  [/^(\d{1,9})([.)])(?=\s|$)/, "$1\\$2"], // ordered list item
  [/^(=+|-{2,})(\s*)$/, "\\$1$2"], // setext underline or thematic break
];

function escapeLine(line: string, lineStart: boolean): string {
  const escaped = line
    .replace(INLINE_SPECIAL, "\\$&")
    .replace(BOUNDARY_UNDERSCORE, "\\_")
    .replace(ENTITY_LIKE, "\\&");
  if (!lineStart) return escaped;
  return LINE_START_RULES.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    escaped
  );
}

/**
 * Escapes plain text for a markdown paragraph. Newlines become hard line
 * breaks, and every line after a break is guarded as a line start.
 * `atLineStart` says whether the text itself begins a line.
 */
export function escapeText(text: string, atLineStart = false): string {
  return text
    .split("\n")
    .map((line, index) => escapeLine(line, atLineStart || index > 0))
    .join("\\\n");
}

// GFM links bare URLs, `www.` domains and email addresses on its own. Some
// parsers look for them after backslash escapes are resolved, so the pattern is
// broken with an invisible zero-width space instead.
const ZERO_WIDTH_SPACE = "\u200B";
const AUTOLINK_TRIGGERS: readonly RegExp[] = [
  /(?<=\b[a-z][a-z\d+.-]*:)(?=\/\/)/gi, // scheme://
  /(?<=\bwww)(?=\.)/gi, // www.
  /(?<=[\w.+-]@)(?=[\w-])/g, // user@domain
];

/** Plain text that no GFM parser will turn into a link. */
export function breakAutolinks(text: string): string {
  return AUTOLINK_TRIGGERS.reduce(
    (result, pattern) => result.replace(pattern, ZERO_WIDTH_SPACE),
    text
  );
}

/**
 * `escapeText` for text a visitor wrote: it must read literally and never
 * become a live link, so bare URLs and addresses are defused as well.
 */
export function escapeVisitorText(text: string, atLineStart = false): string {
  return escapeText(breakAutolinks(text), atLineStart);
}

/** A code span that survives backticks in its content. */
export function codeSpan(text: string): string {
  const longestRun = Math.max(
    0,
    ...Array.from(text.matchAll(/`+/g), (match) => match[0].length)
  );
  const fence = "`".repeat(longestRun + 1);
  const pad = text.startsWith("`") || text.endsWith("`") ? " " : "";
  return `${fence}${pad}${text}${pad}${fence}`;
}

const percentEncode = (char: string) =>
  `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`;

/** A link destination that cannot break out of `(...)`. */
export function escapeUrl(url: string): string {
  return url.trim().replace(/[\s()<>\\]/g, percentEncode);
}

/** An inline link. `label` is plain text and is escaped here. */
export function link(label: string, url: string): string {
  return `[${escapeText(label)}](${escapeUrl(url)})`;
}

/**
 * An ATX heading from inline markdown. A trailing run of `#` after a space
 * would be read as a closing sequence, so it is escaped.
 */
export function heading(level: number, markdown: string): string {
  return `${"#".repeat(level)} ${markdown.replace(/(\s)(#+)(\s*)$/, "$1\\$2$3")}`;
}
