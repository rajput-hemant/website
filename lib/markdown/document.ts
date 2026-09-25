import { site } from "@/content/site";
import { absoluteUrl, displayUrl } from "@/lib/url";

import { escapeText, heading, link } from "./escape";
import { markdownSlug } from "./slugs";

/** The public URL of a page's markdown mirror, e.g. `https://…/work.md`. */
export function markdownUrl(path: string): string {
  return `${site.url}/${markdownSlug(path)}.md`;
}

/** A tight bullet list; each item is already markdown. */
export function bulletList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

/** A line of `·`-separated, already-escaped parts, skipping empty ones. */
export function metaLine(parts: readonly (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" · ");
}

export type MarkdownDocument = {
  title: string;
  /** Canonical page path, e.g. `/work`. */
  path: string;
  /** One plain-text sentence shown under the title. */
  summary?: string;
  /** Markdown chunks; empty ones are dropped. */
  sections: readonly (string | false | undefined)[];
};

/**
 * `# Title`, a front line pointing at the canonical HTML page, then the
 * sections separated by blank lines, ending in a single newline.
 */
export function markdownDocument({
  title,
  path,
  summary,
  sections,
}: MarkdownDocument): string {
  const canonical = absoluteUrl(path);
  const front = summary
    ? `> ${escapeText(summary)} · ${link(displayUrl(canonical), canonical)}`
    : `> ${link(displayUrl(canonical), canonical)}`;

  return `${[heading(1, escapeText(title, true)), front, ...sections]
    .filter((chunk): chunk is string => Boolean(chunk && chunk.trim()))
    .join("\n\n")}\n`;
}
