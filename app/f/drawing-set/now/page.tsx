import type { Metadata } from "next";
import { Log } from "@/flavors/drawing-set/components/now/log";
import { NowSheet } from "@/flavors/drawing-set/components/now/now-sheet";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import {
  Container,
  PageHeader,
  SheetHeading,
} from "@/flavors/drawing-set/components/ui";
import { pageLede, sheetFor } from "@/flavors/drawing-set/content";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { formatRevision } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");
const sheet = sheetFor(page.path)?.sheet ?? "05";

export const metadata: Metadata = pageMetadata(page);

export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const withRev = changelog.map((entry, index) => ({
    ...entry,
    rev: changelog.length - index,
  }));
  const years = groupByYear(withRev);

  return (
    <Page>
      <Container>
        <PageHeader
          sheet={sheet}
          title={page.title}
          lede={pageLede(page.path, page.description)}
        />

        <SceneSlot route="now" size="band" />

        <section aria-label="Current focus">
          <SheetHeading
            n="01"
            title="Current revision"
            aside={`Rev ${formatRevision(now.updatedAt)}`}
          />
          <div className="mt-8">
            <NowSheet items={now.items} />
          </div>
        </section>

        <section
          id="log"
          aria-labelledby="log-heading"
          className="mt-section scroll-mt-[calc(var(--header-height)+1rem)]"
        >
          <SheetHeading n="02" title="The log" id="log-heading" />
          <p className="mt-4 max-w-[60ch] text-ink-soft">
            A running record of what changed: work, projects, this site, and the
            odd bit of life.
          </p>
          <div className="mt-6">
            <Log years={years} />
          </div>
        </section>
      </Container>
    </Page>
  );
}
