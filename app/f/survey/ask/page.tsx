import type { Metadata } from "next";
import { AskPagination } from "@/flavors/survey/components/ask/ask-pagination";
import { ChatComposer } from "@/flavors/survey/components/ask/chat-composer";
import { ChatFeed } from "@/flavors/survey/components/ask/chat-feed";
import { ModerationStrip } from "@/flavors/survey/components/ask/moderation-strip";
import { PendingThreads } from "@/flavors/survey/components/ask/pending-echo";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { SectionHead } from "@/flavors/survey/components/ui/section-head";
import { getRelief } from "@/flavors/survey/lib/sheet";

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

/** The field notebook: questions are entries, and answers are written beside them. */
export default async function AskPage() {
  const [{ items, total }, relief] = await Promise.all([
    getQuestions({ page: 1, pageSize: ASK_PAGE_SIZE }),
    getRelief(),
  ]);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          kicker="Field notebook"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Write it in the notebook, or reply to an entry already there."
          meta={[
            { label: "Entries", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-contour underline-offset-[0.35em]"
                >
                  RSS
                </a>
              ),
            },
          ]}
          scene={{ relief, route: "ask" }}
        />

        <Container
          as="section"
          id="start"
          aria-label="Ask a question"
          className="mt-section scroll-mt-[calc(var(--header-height)+1rem)]"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <ChatComposer
                label="Write in the notebook"
                placeholder="Ask a question…"
                expandedPlaceholder="A question, a thought, or just hello."
                collapsible
              />
            </div>
            <aside
              aria-labelledby="how-heading"
              className="border border-rule-strong p-5 lg:col-span-4"
            >
              <h2 id="how-heading" className="caps">
                How the notebook works
              </h2>
              <ol className="mt-3 grid gap-2 font-serif text-[1.0625rem] italic">
                <li>Every entry is read by hand before it appears.</li>
                <li>I answer myself, in the same entry.</li>
                <li>Once approved, an entry and its replies are public.</li>
              </ol>
            </aside>
          </div>
          <ModerationStrip className="mt-8" />
        </Container>

        <Container
          as="section"
          aria-labelledby="entries-heading"
          className="mt-section"
        >
          <SectionHead
            id="entries-heading"
            kicker="Entries"
            title="Latest conversations"
            aside={total > 0 ? `${total} written` : undefined}
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
