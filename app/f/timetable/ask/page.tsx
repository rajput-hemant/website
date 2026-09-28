import type { Metadata } from "next";
import { AskPagination } from "@/flavors/timetable/components/ask/ask-pagination";
import { ChatComposer } from "@/flavors/timetable/components/ask/chat-composer";
import { ChatFeed } from "@/flavors/timetable/components/ask/chat-feed";
import { ModerationStrip } from "@/flavors/timetable/components/ask/moderation-strip";
import { PendingThreads } from "@/flavors/timetable/components/ask/pending-echo";
import { Page } from "@/flavors/timetable/components/site/page";
import {
  Container,
  PageHeader,
  SectionHead,
} from "@/flavors/timetable/components/ui";

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

/** The information desk: ask at the counter, answers are posted as notices. */
export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          platform="6"
          kicker="Information desk"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Ask at the desk, or reply to a notice already posted."
          meta={[
            { label: "Notices", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-2 underline-offset-[0.2em]"
                >
                  RSS
                </a>
              ),
            },
          ]}
          scene="ask"
        />

        <Container
          as="section"
          id="start"
          aria-label="Ask a question"
          className="mt-section scroll-mt-[calc(var(--header-height)+1rem)]"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <ChatComposer
                label="Ask at the desk"
                placeholder="Ask a question…"
                expandedPlaceholder="A question, a thought, or just hello."
                collapsible
              />
            </div>
            <aside
              aria-labelledby="how-heading"
              className="rounded-lg bg-surface p-5 shadow-[inset_0_0_0_1.5px_var(--color-rule)] lg:col-span-4"
            >
              <h2
                id="how-heading"
                className="font-mono text-mono-sm font-bold tracking-[0.08em] text-ink-soft uppercase"
              >
                How the desk works
              </h2>
              <ol className="mt-3 grid gap-2 text-[0.9375rem] leading-snug">
                <li>1. Every message is read by hand before it appears.</li>
                <li>2. I reply myself, in the same thread.</li>
                <li>3. Once approved, a notice and its replies are public.</li>
              </ol>
            </aside>
          </div>
          <ModerationStrip className="mt-8" />
        </Container>

        <Container
          as="section"
          aria-labelledby="notices-heading"
          className="mt-section"
        >
          <SectionHead
            id="notices-heading"
            kicker="Notices"
            title="Latest conversations"
            aside={total > 0 ? `${total} posted` : undefined}
          />
          <div className="mt-8">
            <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
            <ChatFeed threads={items} startNumber={total} />
            <AskPagination
              page={1}
              pageCount={askPageCount(total)}
              className="mt-10"
            />
          </div>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
