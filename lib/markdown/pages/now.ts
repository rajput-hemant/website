import { sitePage } from "@/content/site";
import { getNow } from "@/lib/data";

import { markdownDocument } from "../document";
import { nowAsOf, nowList } from "../fragments";

export async function nowToMarkdown(): Promise<string> {
  const now = await getNow();
  const page = sitePage("/now");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [nowAsOf(now), nowList(now)],
  });
}
