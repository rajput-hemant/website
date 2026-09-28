import type { Metadata } from "next";
import { AskPagination } from "@/flavors/surface/components/ask/ask-pagination";
import { ChatComposer } from "@/flavors/surface/components/ask/chat-composer";
import { ChatFeed } from "@/flavors/surface/components/ask/chat-feed";
import { ModerationStrip } from "@/flavors/surface/components/ask/moderation-strip";
import { PendingThreads } from "@/flavors/surface/components/ask/pending-echo";
import { Panel } from "@/flavors/surface/components/site/panel";
import { Legend } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";

import { excerpt } from "@/lib/ask/format";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { ASK_PAGE_SIZE, askPageCount } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

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
      <Panel
        ch="06"
        name="Ask"
        aside={
          <a
            href="/ask/feed.xml"
            className="underline underline-offset-2 fine:hover:text-ink"
          >
            RSS feed
          </a>
        }
        title="Ask"
        lede="Curious about something I built, how I work, or anything else? Ask here, or reply to a conversation already running. I read every message before it appears."
        meta={
          <div className="glass inline-flex items-end gap-4 px-4 pt-2.5 pb-3">
            <div>
              <p className="legend mb-1.5 text-[0.59375rem]">Answered</p>
              <Seg
                value={pad2(total)}
                label={`${total} conversations`}
                className="h-10"
              />
            </div>
          </div>
        }
        knob={
          items.length > 0
            ? {
                items: items.map((item) => ({
                  label: excerpt(item.body, 48),
                  href: `/ask/${item.slug}`,
                })),
                unit: "Thread",
                label: "Thread selector",
              }
            : undefined
        }
      >
        <section
          id="start"
          aria-label="Ask a question"
          className="scroll-mt-24"
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_16rem] xl:items-start">
            <ChatComposer
              label="Ask a question"
              placeholder="Ask a question…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
            />
            <HowThisWorks />
          </div>
        </section>

        <ModerationStrip className="mt-8" />

        <section aria-labelledby="conversations" className="mt-16">
          <div className="flex items-baseline justify-between gap-4 pb-4">
            <h2 id="conversations" className="text-h3 tracking-[-0.012em]">
              Latest conversations
            </h2>
            {total > 0 && <Legend as="span">{total} in the queue</Legend>}
          </div>
          <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
          <ChatFeed threads={items} startNumber={total} />
          <AskPagination
            page={1}
            pageCount={askPageCount(total)}
            className="mt-10"
          />
        </section>
      </Panel>
    </OwnerProvider>
  );
}

/** A note beside the input module: what happens once a message is sent. */
function HowThisWorks() {
  return (
    <aside aria-labelledby="how-this-works" className="mod px-5 py-4">
      <h2 id="how-this-works" className="legend">
        How this works
      </h2>
      <ol className="mt-3 grid gap-2.5 text-sm leading-relaxed text-ink-2">
        <li>Every message is read by hand before it appears.</li>
        <li>I reply myself, in the same thread.</li>
        <li>Once approved, a conversation and its replies are public.</li>
      </ol>
    </aside>
  );
}
