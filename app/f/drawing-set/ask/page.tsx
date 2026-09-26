import type { Metadata } from "next";
import { AskPagination } from "@/flavors/drawing-set/components/ask/ask-pagination";
import { ChatComposer } from "@/flavors/drawing-set/components/ask/chat-composer";
import { ChatFeed } from "@/flavors/drawing-set/components/ask/chat-feed";
import { ModerationStrip } from "@/flavors/drawing-set/components/ask/moderation-strip";
import { OwnerProvider } from "@/flavors/drawing-set/components/ask/owner-provider";
import { PendingThreads } from "@/flavors/drawing-set/components/ask/pending-echo";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import {
  Container,
  PageHeader,
  Section,
} from "@/flavors/drawing-set/components/ui";

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

const rssLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 underline underline-offset-2 transition-colors hover:text-accent";

export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Page>
      <OwnerProvider>
        <Container>
          <PageHeader
            sheet="06"
            eyebrow="RFI log"
            title="Questions (RFI)"
            lede="Curious about something I built, how I work, or anything else? Submit an RFI or reply to one already filed. Every message is read by hand before it's filed here."
            meta={[
              {
                label: "Feed",
                value: (
                  <a href="/ask/feed.xml" className={rssLinkClass}>
                    RSS
                  </a>
                ),
              },
            ]}
          />

          <SceneSlot route="ask" size="band" />

          <Section id="start" className="scroll-mt-24 pt-0">
            <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-start lg:gap-12">
              <ChatComposer
                label="Submit an RFI"
                placeholder="Submit an RFI…"
                expandedPlaceholder="A question, a thought, or just hello."
                collapsible
              />
              <HowThisWorks />
            </div>
          </Section>

          <ModerationStrip className="mt-4 mb-2" />

          <Section id="conversations" title="Latest conversations">
            {total > 0 && (
              <p className="-mt-6 mb-6 font-mono text-mono-xs text-ink-faint tabular-nums">
                {total} filed
              </p>
            )}
            <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
            <ChatFeed threads={items} startNumber={total} />
            <AskPagination
              page={1}
              pageCount={askPageCount(total)}
              className="mt-10"
            />
          </Section>
        </Container>
      </OwnerProvider>
    </Page>
  );
}

/** A margin note beside the composer: what happens to a slip once it's sent. */
function HowThisWorks() {
  return (
    <aside
      aria-labelledby="how-this-works"
      className="rounded-md border border-line px-5 py-4"
    >
      <h2
        id="how-this-works"
        className="font-mono text-mono-xs tracking-[0.14em] text-ink-soft uppercase"
      >
        How this works
      </h2>
      <ol className="mt-3 grid gap-2.5 text-sm leading-relaxed text-ink-soft">
        <li>Every message is read by hand before it appears.</li>
        <li>I reply myself, in the same thread.</li>
        <li>Once approved, a conversation and its replies are public.</li>
      </ol>
    </aside>
  );
}
