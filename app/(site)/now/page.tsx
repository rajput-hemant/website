import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { pageMetadata } from "@/lib/metadata";
import { Log } from "@/components/now/log";
import { NowSheet } from "@/components/now/now-sheet";
import { Page, SceneSlot } from "@/components/site";
import { Container, DateStamp, PageHeader } from "@/components/ui";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <Container>
        <PageHeader
          eyebrow="Drawer 03 · Now"
          title={page.title}
          lede={page.description}
          meta={
            <p className="font-mono text-mono-xs text-pencil">
              Updated <DateStamp date={now.updatedAt} precision="day" />
            </p>
          }
        />

        <SceneSlot route="now" size="window" />

        <section aria-label="Current focus">
          <NowSheet items={now.items} />
        </section>

        <section
          id="log"
          aria-labelledby="log-heading"
          className="mt-section scroll-mt-[calc(var(--header-height)+1rem)]"
        >
          <h2 id="log-heading" className="font-display text-2xl text-paper">
            The log
          </h2>
          <p className="mt-1.5 max-w-[60ch] text-graphite">
            A running record of what changed, before it was Now: work, projects,
            this site, and the odd bit of life.
          </p>
          <div className="mt-6">
            <Log years={years} />
          </div>
        </section>
      </Container>
    </Page>
  );
}
