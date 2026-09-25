import { site } from "@/content/site";
import type { IsoDate } from "@/lib/data/types";

import { escapeText, heading, link } from "./escape";
import { markdownSlug } from "./slugs";

/** The public URL of a page's markdown mirror, e.g. `https://…/work.md`. */
export function markdownUrl(path: string): string {
  return `${site.url}/${markdownSlug(path)}.md`;
}

export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** `2026-01-01` → `Jan 2026`. Parsed as text so time zones cannot shift it. */
export function formatMonth(date: IsoDate): string {
  const [year = "", month = "1"] = date.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`.trim();
}

/** `2026-09-25` (or a full timestamp) → `Sep 25, 2026`. */
export function formatDay(date: string): string {
  const [year = "", month = "1", day = "1"] = date.slice(0, 10).split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ${Number(day)}, ${year}`;
}

export function formatRange(start: IsoDate, end?: IsoDate): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "present"}`;
}

/** `https://www.zunta.com/x` → `zunta.com`. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
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
    ? `> ${escapeText(summary)} · ${link(displayPath(canonical), canonical)}`
    : `> ${link(displayPath(canonical), canonical)}`;

  return `${[heading(1, escapeText(title, true)), front, ...sections]
    .filter((chunk): chunk is string => Boolean(chunk && chunk.trim()))
    .join("\n\n")}\n`;
}

function displayPath(url: string): string {
  return url.replace(/^https?:\/\//, "");
}
