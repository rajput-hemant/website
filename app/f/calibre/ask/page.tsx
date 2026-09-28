import type { Metadata } from "next";
import { Composer } from "@/flavors/calibre/components/ask/composer";
import { Feed } from "@/flavors/calibre/components/ask/feed";
import { ModerationStrip } from "@/flavors/calibre/components/ask/moderation-strip";
import { Pagination } from "@/flavors/calibre/components/ask/pagination";
import { PendingThreads } from "@/flavors/calibre/components/ask/pending";
import { Face } from "@/flavors/calibre/components/dial/face";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { SectionHead } from "@/flavors/calibre/components/ui/section-head";
import { bezelPrints } from "@/flavors/calibre/lib/movement";

import { loadAskList } from "@/lib/ask/pages/load";
import { askMetadata } from "@/lib/ask/pages/metadata";
import { getProfile, getProjects, getSiteIdentity } from "@/lib/data";
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

/** The engraving request book: every question on its own card, the answer engraved beneath it. */
export default async function AskPage() {
  const site = await getSiteIdentity();
  const { items, total, pageCount } = await loadAskList(1);
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          hour={null}
          kicker="Engraving requests"
          title="Ask"
          lede="Curious about something I built, how I work, or anything else? Write a request in the book, or answer one already there."
          meta={[
            { label: "Requests", value: String(total) },
            {
              label: "Feed",
              value: (
                <a
                  href="/ask/feed.xml"
                  className="underline decoration-steel underline-offset-[0.2em]"
                >
                  RSS
                </a>
              ),
            },
          ]}
          prints={bezelPrints(projects.length, profile.location, site.initials)}
          dial={<Face figure={total} unit="Requests" />}
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
              placeholder="Write your request…"
              expandedPlaceholder="A question, a thought, or just hello."
              collapsible
              className="lg:col-span-8"
            />
            <aside
              aria-labelledby="how-heading"
              className="border-t border-line-strong pt-4 lg:col-span-4"
            >
              <h2 id="how-heading" className="spec">
                How the book works
              </h2>
              <ol className="mt-3 grid gap-2 text-sm leading-snug text-soft">
                <li>1. Every note is read by hand before it appears.</li>
                <li>2. I answer myself, under the same request.</li>
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
          aria-labelledby="requests-heading"
          className="mt-section"
        >
          <SectionHead
            id="requests-heading"
            kicker="In the book"
            title="Latest questions"
            aside={total > 0 ? `${total} requests` : undefined}
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
