import type { Metadata } from "next";
import { Composer } from "@/flavors/mission/components/ask/composer";
import { Feed } from "@/flavors/mission/components/ask/feed";
import { ModerationStrip } from "@/flavors/mission/components/ask/moderation-strip";
import { Pagination } from "@/flavors/mission/components/ask/pagination";
import { PendingThreads } from "@/flavors/mission/components/ask/pending";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import { flightPlan } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { loadAskList } from "@/lib/ask/pages/load";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { getExperience, getProjects } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = askMetadata({
  title: "Ask",
  description:
    "Questions, comments and hellos, as open conversations. Every visitor message is read and approved before it appears.",
  path: "/ask",
  siteImage: false,
});

/** Capcom: open a channel with a question; the answers come back on the same loop. */
export default async function AskPage() {
  const [{ items, total, pageCount }, projects, experience] = await Promise.all(
    [loadAskList(1), getProjects(), getExperience()]
  );

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          section={7}
          kicker="Capcom"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Open a channel, or reply to a transmission already on the loop."
          meta={[
            { label: "Transcripts", value: `${total} on the loop` },
            {
              label: "Feed",
              value: (
                <a href="/ask/feed.xml" className="rule-link">
                  RSS
                </a>
              ),
            },
          ]}
          scene={{
            route: "ask",
            board: boardFor(flightPlan(experience, projects, new Date())),
            caption: "The phases in flight as you transmit.",
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
              placeholder="Open a channel…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t border-rule-strong pt-4"
            >
              <h2 id="how-heading" className="label">
                How the loop works
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug text-ink-soft">
                <li>
                  1. Every transmission is read by hand before it goes out.
                </li>
                <li>2. I answer myself, on the same channel.</li>
                <li>3. Once approved, the transcript is public.</li>
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
            title="Transcripts"
            size="h2"
            number="7.1"
            aside={total > 0 ? `${total} on the loop` : undefined}
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
