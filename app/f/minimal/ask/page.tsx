import type { Metadata } from "next";
import { AskPagination } from "@/flavors/minimal/components/ask/ask-pagination";
import { ChatComposer } from "@/flavors/minimal/components/ask/chat-composer";
import { ChatFeed } from "@/flavors/minimal/components/ask/chat-feed";
import { ModerationStrip } from "@/flavors/minimal/components/ask/moderation-strip";
import { OwnerProvider } from "@/flavors/minimal/components/ask/owner-provider";
import { PendingThreads } from "@/flavors/minimal/components/ask/pending-echo";
import { Container } from "@/flavors/minimal/components/site/container";
import { FrameNote } from "@/flavors/minimal/components/site/frame";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";
import { Section } from "@/flavors/minimal/components/site/section";

import { askMetadata } from "@/lib/ask/pages/metadata";
import { ASK_PAGE_SIZE, askPageCount } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";

const description =
  "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.";

export const metadata: Metadata = askMetadata({
  title: "Ask",
  description,
  path: "/ask",
  siteImage: false,
});

export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <OwnerProvider>
      <Container className="stagger">
        <PageHeader
          title="Ask me anything, or just say hi."
          description="Curious about something I built, how I work, or anything else? Start a conversation or reply to one. Every message is read by hand before it appears here."
          meta={
            <a
              href="/ask/feed.xml"
              className="hit-area link hover:text-foreground"
            >
              RSS feed
            </a>
          }
        />

        <Section id="start" className="relative scroll-mt-(--header-h) pt-0">
          <HowThisWorks />
          <ChatComposer
            label="Start a conversation"
            placeholder="Start a conversation…"
            expandedPlaceholder="A question, a thought, or just hello."
            collapsible
          />
        </Section>

        <ModerationStrip className="mt-4 mb-2" />

        <Section aria-labelledby="conversations">
          <h2 id="conversations" className="mb-3 meta text-subtle">
            Latest conversations
            {total > 0 && (
              <>
                <span aria-hidden className="text-faint">
                  {" "}
                  ·{" "}
                </span>
                <span className="sr-only">, </span>
                <span className="tabular-nums">{total}</span>
              </>
            )}
          </h2>
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

/** A margin note on wide screens: what happens to a message once it's sent. */
function HowThisWorks() {
  return (
    <FrameNote aria-labelledby="how-this-works">
      <h2 id="how-this-works" className="meta text-subtle">
        How this works
      </h2>
      <ol className="mt-3 grid gap-2.5 text-sm leading-relaxed text-muted">
        <li>Every message is read by hand before it appears.</li>
        <li>I reply myself, in the same thread.</li>
        <li>Once approved, a conversation and its replies are public.</li>
      </ol>
    </FrameNote>
  );
}
