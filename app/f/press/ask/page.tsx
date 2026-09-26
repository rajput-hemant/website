import type { Metadata } from "next";
import { Composer } from "@/flavors/press/components/ask/composer";
import { Feed } from "@/flavors/press/components/ask/feed";
import { ModerationStrip } from "@/flavors/press/components/ask/moderation-strip";
import { Pagination } from "@/flavors/press/components/ask/pagination";
import { PendingThreads } from "@/flavors/press/components/ask/pending";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { SectionHead } from "@/flavors/press/components/ui/section-head";

import { askMetadata } from "@/lib/ask/pages/metadata";
import { ASK_PAGE_SIZE, askPageCount } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = askMetadata({
  title: "Ask",
  description:
    "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.",
  path: "/ask",
  siteImage: false,
});

/** The corrections sheet: send a query in the margin; the author answers on the proof. */
export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          sheet={7}
          kicker="Corrections sheet"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Mark a query on the sheet, or answer one already there."
          meta={[
            { label: "Queries", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-pink decoration-2 underline-offset-[0.2em]"
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
          aria-label="Send a query"
          className="mt-section scroll-mt-8"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <Composer
              label="Send a query"
              placeholder="Mark a query…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
              className="lg:col-span-8"
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t-2 border-ink pt-4 lg:col-span-4"
            >
              <h2 id="how-heading" className="slug">
                How the sheet works
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug">
                <li>1. Every query is read by hand before it appears.</li>
                <li>2. I answer myself, in the same thread.</li>
                <li>3. Once approved, a query and its replies are public.</li>
              </ol>
            </aside>
          </div>
          <ModerationStrip className="mt-8" />
        </Container>

        <Container
          as="section"
          aria-labelledby="queries-heading"
          className="mt-section"
        >
          <SectionHead
            id="queries-heading"
            kicker="On the sheet"
            title="Latest queries"
            size="h2"
            aside={total > 0 ? `${total} marked` : undefined}
          />
          <div className="mt-8">
            <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
            <Feed threads={items} startNumber={total} />
            <Pagination
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
