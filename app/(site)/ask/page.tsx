import type { Metadata } from "next";

import { getQuestions } from "@/lib/data";
import { AskPagination } from "@/components/ask/ask-pagination";
import { ChatComposer } from "@/components/ask/chat-composer";
import { ChatFeed } from "@/components/ask/chat-feed";
import { ModerationStrip } from "@/components/ask/moderation-strip";
import { OwnerProvider } from "@/components/ask/owner-provider";
import { PendingThreads } from "@/components/ask/pending-echo";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { SectionHeading } from "@/components/ui/section-heading";

import { askMetadata } from "./_lib/metadata";
import { ASK_PAGE_SIZE, askPageCount } from "./_lib/pagination";

const description =
  "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.";

export const metadata: Metadata = askMetadata({
  title: "Ask",
  description,
  path: "/ask",
  siteImage: false,
});

const conversationsLabel = (count: number) =>
  count === 1 ? "1 conversation" : `${count} conversations`;

export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <OwnerProvider>
      <Container>
        <PageHeader
          title="Ask me anything, or just say hi."
          description="Curious about something I built, how I work, or anything else? Start a conversation or reply to one. Every message is read by hand before it appears here."
          meta={
            <a href="/ask/feed.xml" className="link hover:text-foreground">
              RSS feed
            </a>
          }
        />

        <Section id="start" className="scroll-mt-(--header-h) pt-0">
          <ChatComposer
            label="Start a conversation"
            placeholder="Start a conversation…"
            expandedPlaceholder="A question, a thought, or just hello."
            collapsible
          />
        </Section>

        <ModerationStrip className="mt-4 mb-2" />

        <Section aria-labelledby="conversations">
          <SectionHeading
            id="conversations"
            eyebrow={total > 0 ? conversationsLabel(total) : "Conversations"}
            title="Latest conversations"
          />
          <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
          <ChatFeed threads={items} />
          <AskPagination
            page={1}
            pageCount={askPageCount(total)}
            className="mt-10"
          />
        </Section>
      </Container>
    </OwnerProvider>
  );
}
