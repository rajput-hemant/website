import type { Metadata } from "next";
import { Composer } from "@/flavors/maquette/components/ask/composer";
import { Feed } from "@/flavors/maquette/components/ask/feed";
import { ModerationStrip } from "@/flavors/maquette/components/ask/moderation-strip";
import { Pagination } from "@/flavors/maquette/components/ask/pagination";
import { PendingThreads } from "@/flavors/maquette/components/ask/pending";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { SectionHead } from "@/flavors/maquette/components/ui/section-head";
import { siteBoard } from "@/flavors/maquette/lib/site-board";

import { site } from "@/content/site";
import { loadAskList } from "@/lib/ask/pages/load";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = askMetadata({
  title: "Ask",
  description:
    "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.",
  path: "/ask",
  siteImage: false,
});

/** Comment cards pinned to the model: every question on its own card, the answer written under it. */
export default async function AskPage() {
  const [{ items, total, pageCount }, board] = await Promise.all([
    loadAskList(1),
    siteBoard(),
  ]);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          frame="06"
          kicker="Comment cards"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Pin a comment card to the model, or answer one already there."
          meta={[
            { label: "Cards", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-cut underline-offset-[0.2em]"
                >
                  RSS
                </a>
              ),
            },
          ]}
          scene="ask"
          board={board}
          sceneLabel="Comment cards pinned to the model"
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
              placeholder="Write on the card…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
              className="lg:col-span-8"
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t border-line pt-4 lg:col-span-4"
            >
              <h2 id="how-heading" className="caps">
                How the cards work
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug text-soft">
                <li>1. Every note is read by hand before it appears.</li>
                <li>2. I answer myself, on the same card.</li>
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
            kicker="Pinned to the model"
            title="Latest questions"
            aside={total > 0 ? `${total} cards` : undefined}
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
