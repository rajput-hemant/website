import type { Metadata } from "next";
import { Composer } from "@/flavors/darkroom/components/ask/composer";
import { Feed } from "@/flavors/darkroom/components/ask/feed";
import { ModerationStrip } from "@/flavors/darkroom/components/ask/moderation-strip";
import { Pagination } from "@/flavors/darkroom/components/ask/pagination";
import { PendingThreads } from "@/flavors/darkroom/components/ask/pending";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { loadAskList } from "@/lib/ask/pages/load";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { getSiteIdentity } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export function generateMetadata(): Promise<Metadata> {
  return askMetadata({
    title: "Ask",
    description:
      "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.",
    path: "/ask",
    siteImage: false,
  });
}

/** The sleeves: every question in its own glassine, the answer written beside it. */
export default async function AskPage() {
  const site = await getSiteIdentity();
  const { items, total, pageCount } = await loadAskList(1);
  const board = encodeBoard(
    items.map((item, i) => ({
      archetype: i % 2 ? "hills" : "sun",
      seed: i,
      select: item.replies.some((reply) => reply.by === "owner"),
    }))
  );

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          frame="06"
          kicker="Sleeves"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Leave a note on a sleeve, or answer one already there."
          meta={[
            { label: "Sleeves", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-grease underline-offset-[0.2em]"
                >
                  RSS
                </a>
              ),
            },
          ]}
          scene="ask"
          board={board}
        />

        <Container
          as="section"
          id="start"
          aria-label="Ask a question"
          className="mt-section scroll-mt-8"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <Composer
              handle={site.handle}
              label="Ask a question"
              placeholder="Write on the sleeve…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
              className="lg:col-span-8"
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t border-line-strong pt-4 lg:col-span-4"
            >
              <h2 id="how-heading" className="edge">
                How the sleeves work
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug text-soft">
                <li>1. Every note is read by hand before it appears.</li>
                <li>2. I answer myself, in the same sleeve.</li>
                <li>
                  3. Once approved, a question and its replies are public.
                </li>
              </ol>
            </aside>
          </div>
          <ModerationStrip className="mt-8" />
        </Container>

        <Container
          as="section"
          aria-labelledby="sleeves-heading"
          className="mt-section"
        >
          <SectionHead
            id="sleeves-heading"
            kicker="In the file"
            title="Latest questions"
            aside={total > 0 ? `${total} sleeves` : undefined}
          />
          <div className="mt-8">
            <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
            <Feed threads={items} startNumber={total} />
            <Pagination page={1} pageCount={pageCount} className="mt-10" />
          </div>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
