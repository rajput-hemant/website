import type { Metadata } from "next";
import { Revisions } from "@/flavors/maquette/components/now/revisions";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { linkClass } from "@/flavors/maquette/components/ui/link-class";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { SectionHead } from "@/flavors/maquette/components/ui/section-head";
import { siteBoard } from "@/flavors/maquette/lib/site-board";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** The current revision of the model, then every earlier one in the log, by year. */
export default async function NowPage() {
  const [now, changelog, board] = await Promise.all([
    getNow(),
    getChangelog(),
    siteBoard(),
  ]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <PageHeader
        frame="05"
        kicker="Revisions"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Revised", value: formatDate(now.updatedAt) },
          { label: "In the log", value: `${changelog.length} revisions` },
        ]}
        scene="now"
        board={board}
      />

      <Container
        as="section"
        aria-labelledby="line-heading"
        className="mt-section"
      >
        <SectionHead
          id="line-heading"
          kicker="On the bench"
          title="The current revision"
        />
        <Revisions items={now.items} className="mt-10" />
      </Container>

      <Container
        as="section"
        id="log"
        aria-labelledby="log-heading"
        className="mt-section scroll-mt-8"
      >
        <SectionHead
          id="log-heading"
          kicker="Superseded, filed by year"
          title="Log"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-4">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className={`inline-flex min-h-11 items-center font-mono text-sm ${linkClass}`}
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
              className="grid gap-x-6 border-b border-line md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-8 pt-4 text-[1.625rem] font-light"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-5 gap-y-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_7rem] sm:items-baseline"
                  >
                    <time dateTime={entry.date} className="num text-ink">
                      {formatShortDate(entry.date)}
                    </time>
                    <p className="leading-snug">
                      {entry.link ? (
                        <a href={entry.link} className={linkClass}>
                          {entry.text}
                        </a>
                      ) : (
                        entry.text
                      )}
                    </p>
                    <span className="num sm:text-right">
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
