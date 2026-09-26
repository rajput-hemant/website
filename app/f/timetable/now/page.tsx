import type { Metadata } from "next";
import { Page } from "@/flavors/timetable/components/site/page";
import {
  Container,
  PageHeader,
  Section,
  SectionHead,
  Tag,
} from "@/flavors/timetable/components/ui";
import { RowFilter } from "@/flavors/timetable/components/ui/row-filter";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** Current position, then every service update, newest first, by year. */
export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
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
        platform="5"
        kicker="Current position"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Last updated", value: formatDate(now.updatedAt) },
          { label: "Service updates", value: String(changelog.length) },
        ]}
        scene="now"
      />

      <Section id="position" kicker="You are here" title="Current position">
        <ol className="grid gap-3 md:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              data-scene-item={`now:${i}`}
              data-scene-label={`Notice ${i + 1}|${now.items.length} in force`}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-4 rounded-md bg-surface px-5 py-5 shadow-[inset_4px_0_0_var(--color-signal)]"
            >
              <span className="font-mono text-mono-sm font-bold text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-lead leading-snug">
                {item.link ? (
                  <a
                    href={item.link}
                    className="underline decoration-rule-strong decoration-2 underline-offset-[0.22em] fine:hover:decoration-ink"
                  >
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
          kicker="Service updates"
          title="What changed"
          aside={
            <nav aria-label="Years" className="flex flex-wrap gap-x-4">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#year-${year.year}`}
                  className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-rule-strong decoration-2 underline-offset-[0.25em]"
                >
                  {year.year}
                </a>
              ))}
            </nav>
          }
        />
        <RowFilter
          boardId="updates"
          filterKey="category"
          label="Filter updates by category"
          allLabel="All updates"
          options={options}
          className="mt-6"
        />
        <div id="updates" data-scene-section className="mt-6">
          {years.map((year) => (
            <section
              key={year.year}
              data-filter-group
              aria-labelledby={`year-${year.year}`}
              className="grid gap-x-6 border-t-[3px] border-rule-strong md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`year-${year.year}`}
                className="scroll-mt-[calc(var(--header-height)+1rem)] pt-4 font-mono text-h3 font-bold tracking-normal"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    data-category={entry.category}
                    className="grid gap-x-5 gap-y-2 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-baseline"
                  >
                    <time
                      dateTime={entry.date}
                      className="font-mono text-mono font-bold"
                    >
                      {formatShortDate(entry.date)}
                    </time>
                    <p className="leading-snug">
                      {entry.link ? (
                        <a
                          href={entry.link}
                          className="underline decoration-rule-strong decoration-2 underline-offset-[0.22em] fine:hover:decoration-ink"
                        >
                          {entry.text}
                        </a>
                      ) : (
                        entry.text
                      )}
                    </p>
                    <Tag className="justify-self-start text-xs">
                      {updateCategoryLabels[entry.category]}
                    </Tag>
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
