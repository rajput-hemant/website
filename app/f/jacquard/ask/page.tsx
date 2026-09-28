import type { Metadata } from "next";
import { Composer } from "@/flavors/jacquard/components/ask/composer";
import { Feed } from "@/flavors/jacquard/components/ask/feed";
import { ModerationStrip } from "@/flavors/jacquard/components/ask/moderation-strip";
import { Pagination } from "@/flavors/jacquard/components/ask/pagination";
import { PendingThreads } from "@/flavors/jacquard/components/ask/pending";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { buildDraft } from "@/flavors/jacquard/lib/weave";

import { loadAskList } from "@/lib/ask/pages/load";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { getProjects } from "@/lib/data";
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

/** The sampler board: pin a question; the answers are stitched beside it. */
export default async function AskPage() {
  const [{ items, total, pageCount }, projects] = await Promise.all([
    loadAskList(1),
    getProjects(),
  ]);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          card={7}
          kicker="Sampler board"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Pin a question to the board, or answer one already there."
          meta={[
            { label: "Pinned", value: `${total} questions` },
            {
              label: "Feed",
              value: (
                <a href="/ask/feed.xml" className="thread-link">
                  RSS
                </a>
              ),
            },
          ]}
          scene={{
            route: "ask",
            weave: draftWeave(buildDraft(projects)),
            caption: "The sample book's cloth, hung by the board.",
          }}
        />

        <Container
          as="section"
          id="start"
          aria-label="Ask a question"
          className="mt-section scroll-mt-8"
        >
          <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
            <Composer
              label="Ask a question"
              placeholder="Pin a question…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t border-rule-strong pt-4"
            >
              <h2 id="how-heading" className="label">
                How the board works
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug text-ink-soft">
                <li>1. Every question is read by hand before it is pinned.</li>
                <li>2. I answer myself, in the same thread.</li>
                <li>
                  3. Once approved, a question and its answers are public.
                </li>
              </ol>
            </aside>
          </div>
          <ModerationStrip className="mt-8" />
        </Container>

        <Container
          as="section"
          aria-labelledby="board-heading"
          className="mt-section"
        >
          <SectionHead
            id="board-heading"
            title="On the board"
            size="h2"
            aside={total > 0 ? `${total} pinned` : undefined}
          />
          <div className="mt-12">
            <PendingThreads publishedSlugs={items.map((item) => item.slug)} />
            <Feed threads={items} startNumber={total} />
            <Pagination page={1} pageCount={pageCount} className="mt-12" />
          </div>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
