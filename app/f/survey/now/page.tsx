import type { Metadata } from "next";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { RowFilter } from "@/flavors/survey/components/ui/row-filter";
import { Section } from "@/flavors/survey/components/ui/section";
import { SectionHead } from "@/flavors/survey/components/ui/section-head";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

const linkClass =
  "underline decoration-revision/50 underline-offset-[0.3em] fine:hover:text-revision";

/** Revision notes: this edition's changes in purple, then every earlier revision by year. */
export default async function NowPage() {
  const [now, changelog, relief] = await Promise.all([
    getNow(),
    getChangelog(),
    getRelief(),
  ]);
  const years = groupByYear(changelog);
  const counts = new Map<string, number>();
  for (const entry of changelog) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }
  const options = [...counts].map(([slug, count]) => ({
    slug,
    label: updateCategoryLabels[slug as keyof typeof updateCategoryLabels],
    count,
  }));

  return (
    <Page>
      <PageHeader
        kicker="Revision notes"
        title={page.title}
        lede={page.description}
        meta={[
          {
            label: "Revised",
            value: (
              <span className="text-revision">{formatDate(now.updatedAt)}</span>
            ),
          },
          { label: "Earlier revisions", value: String(changelog.length) },
        ]}
        scene={{ relief, route: "now" }}
      />

      <Section
        id="position"
        kicker="Revised this edition"
        title="Current position"
      >
        <ol className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-3 border-l-2 border-revision pl-4"
            >
              <span className="caps text-revision tabular-nums">
                R{String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-serif text-statement">
                {item.link ? (
                  <a href={item.link} className={linkClass}>
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Container
        as="section"
        id="log"
        aria-labelledby="log-heading"
        className="mt-section scroll-mt-[calc(var(--header-height)+1rem)]"
      >
        <SectionHead
          id="log-heading"
          kicker="Earlier revisions"
          title="What changed"
          aside={
            <nav aria-label="Years" className="flex flex-wrap gap-x-5">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className="inline-flex min-h-11 items-center font-sans font-semibold tracking-[0.08em] tabular-nums underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
                >
                  {year.year}
                </a>
              ))}
            </nav>
          }
        />
        <RowFilter
          boardId="revisions"
          filterKey="category"
          label="Filter revisions by category"
          allLabel="All revisions"
          options={options}
          className="mt-6"
        />
        <div id="revisions" className="mt-6">
          <p aria-live="polite" className="sr-only">
            <span data-board-count>{changelog.length}</span> revisions shown
          </p>
          {years.map((year) => (
            <section
              key={year.year}
              data-filter-group
              aria-labelledby={`log-${year.year}`}
              className="grid gap-x-10 border-t-[1.5px] border-rule-strong md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-[calc(var(--header-height)+1rem)] pt-4 font-sans text-h3 font-semibold tracking-[0.08em] tabular-nums"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    data-category={entry.category}
                    className="grid gap-x-6 gap-y-1.5 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-baseline"
                  >
                    <time dateTime={entry.date} className="caps text-ink-faint">
                      {formatShortDate(entry.date)}
                    </time>
                    <p>
                      {entry.link ? (
                        <a
                          href={entry.link}
                          className="underline decoration-contour underline-offset-[0.3em] fine:hover:text-water"
                        >
                          {entry.text}
                        </a>
                      ) : (
                        entry.text
                      )}
                    </p>
                    <span className="caps text-ink-soft">
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
