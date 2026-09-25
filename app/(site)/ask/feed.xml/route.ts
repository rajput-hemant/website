import { site } from "@/content/site";
import { getQuestions } from "@/lib/data";
import { type ChatReply, type Question } from "@/lib/data/types";
import { askEntryHref, excerpt } from "@/components/ask/format";

/**
 * Prerendered at build time; the `question` tag on the data fetch refreshes it
 * whenever a thread or reply is published. One item per thread, dated by its
 * latest activity.
 */
export const dynamic = "force-static";

const FEED_SIZE = 50;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toRfc822 = (iso: string) => new Date(iso).toUTCString();

function authorName(message: Pick<ChatReply, "by" | "authorName">): string {
  return message.by === "owner"
    ? `${site.name} (owner)`
    : (message.authorName ?? "Anonymous");
}

/** The whole conversation as plain text: visitor text is never markup. */
function describe(question: Question): string {
  return [
    `${authorName(question)}:\n${question.body}`,
    ...question.replies.map(
      (reply) => `${authorName(reply)} replied:\n${reply.body}`
    ),
  ].join("\n\n");
}

function renderItem(question: Question): string {
  const link = `${site.url}${askEntryHref(question.slug)}`;
  return `<item>
      <title>${escapeXml(excerpt(question.body, 80))}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(question.lastActivityAt)}</pubDate>
      <description>${escapeXml(describe(question))}</description>
    </item>`;
}

export async function GET() {
  const { items } = await getQuestions({ page: 1, pageSize: FEED_SIZE });
  const feedUrl = `${site.url}/ask/feed.xml`;
  const lastBuild = items[0]?.lastActivityAt;

  const channel = [
    `<title>${escapeXml(`Ask · ${site.name}`)}</title>`,
    `<link>${escapeXml(`${site.url}/ask`)}</link>`,
    `<description>${escapeXml(`Conversations with visitors on ${site.name}'s /ask page, latest activity first.`)}</description>`,
    "<language>en</language>",
    `<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...(lastBuild
      ? [`<lastBuildDate>${toRfc822(lastBuild)}</lastBuildDate>`]
      : []),
    ...items.map(renderItem),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    ${channel.join("\n    ")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
