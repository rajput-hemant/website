import type { Metadata } from "next";
import { DryingLine } from "@/flavors/darkroom/components/now/drying-line";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { linkClass } from "@/flavors/darkroom/components/ui/link-class";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { hrefProps } from "@/lib/safe-href";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** The drying line: what's hanging now, then every earlier print in the log, by year. */
export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <PageHeader
        frame="05"
        kicker="Drying line"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Hung", value: formatDate(now.updatedAt) },
          { label: "In the log", value: String(changelog.length) },
        ]}
        scene="now"
        board={encodeBoard(
          now.items.map((_, i) => ({
            archetype: i % 2 ? "hills" : "sun",
            seed: i,
            select: false,
          }))
        )}
      />

      <Container
        as="section"
        aria-labelledby="line-heading"
        className="mt-section"
      >
        <SectionHead
          id="line-heading"
          kicker="Still wet"
          title="On the line now"
        />
        <DryingLine items={now.items} className="mt-10" />
      </Container>

      <Container
        as="section"
        id="log"
        aria-labelledby="log-heading"
        className="mt-section scroll-mt-8"
      >
        <SectionHead
          id="log-heading"
          kicker="Dry, filed by year"
          title="Log"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-4">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className={`inline-flex min-h-11 items-center font-semibold ${linkClass}`}
                >
                  {year.year}
                </a>
              ))}
            </nav>
          }
        />
        <div data-scene-section>
          {years.map((year) => (
            <section
              key={year.year}
              aria-labelledby={`log-${year.year}`}
              className="grid gap-x-6 border-b border-line-strong md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-8 pt-4 text-[1.625rem] tracking-[-0.03em]"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-5 gap-y-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_7rem] sm:items-baseline"
                  >
                    <time dateTime={entry.date} className="edge text-ink!">
                      {formatShortDate(entry.date)}
                    </time>
                    <p className="leading-snug">
                      {entry.link ? (
                        <a {...hrefProps(entry.link)} className={linkClass}>
                          {entry.text}
                        </a>
                      ) : (
                        entry.text
                      )}
                    </p>
                    <span className="edge sm:text-right">
                      {updateCategoryLabels[entry.category]}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Container>
    </Page>
  );
}
