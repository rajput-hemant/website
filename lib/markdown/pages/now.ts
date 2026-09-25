import { getNow } from "@/lib/data";

import { markdownDocument } from "../document";
import { nowAsOf, nowList } from "../fragments";
import { pageInfo } from "./page-info";

export async function nowToMarkdown(): Promise<string> {
  const now = await getNow();
  const page = pageInfo("/now");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [nowAsOf(now), nowList(now)],
  });
}
