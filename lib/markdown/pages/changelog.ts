import { sitePage } from "@/content/site";
import { getChangelog } from "@/lib/data";
import { updateCategoryLabels } from "@/lib/data/labels";
import type { Update } from "@/lib/data/types";

import { bulletList, markdownDocument, metaLine } from "../document";
import { escapeText, link } from "../escape";

function entry(update: Update): string {
  const text = update.link
    ? link(update.text, update.link)
    : escapeText(update.text);
  return metaLine([
    `\`${update.date}\``,
    updateCategoryLabels[update.category],
    text,
  ]);
}

/** Groups newest-first updates by year, keeping their order. */
function byYear(updates: readonly Update[]): [string, Update[]][] {
  const groups = new Map<string, Update[]>();
  for (const update of updates) {
    const year = update.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), update]);
  }
  return [...groups];
}

export async function changelogToMarkdown(): Promise<string> {
  const updates = await getChangelog();
  const page = sitePage("/changelog");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: byYear(updates).flatMap(([year, entries]) => [
      `## ${year}`,
      bulletList(entries.map(entry)),
    ]),
  });
}
