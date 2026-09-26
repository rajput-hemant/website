import type { Metadata } from "next";
import { NowItem } from "@/flavors/press/components/now/now-item";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { SectionHead } from "@/flavors/press/components/ui/section-head";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

const linkClass =
  "underline decoration-pink decoration-2 underline-offset-[0.22em] fine:hover:decoration-blue";

/** The latest proof, in yellow, then every earlier correction to the job, by year. */
export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <PageHeader
        sheet={6}
        kicker="Latest proof"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Proofed", value: formatDate(now.updatedAt) },
          { label: "Log entries", value: String(changelog.length) },
        ]}
        scene="now"
      />

      <Container
        as="section"
        aria-labelledby="current-heading"
        className="mt-section"
      >
        <SectionHead
          id="current-heading"
          kicker="P3 marks what is current"
          title="On press now"
          size="h2"
        />
        <ol className="mt-8 grid gap-x-6 gap-y-5 md:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              data-scene-item={`now:${i}`}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-t-2 border-ink pt-4"
            >
              <span className="slug">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[clamp(1.1875rem,1rem+0.5vw,1.4375rem)] leading-snug">
                <NowItem item={item} />
              </p>
            </li>
          ))}
        </ol>
      </Container>

      <Container
        as="section"
        id="log"
        aria-labelledby="log-heading"
        className="mt-section scroll-mt-8"
      >
        <SectionHead
          id="log-heading"
          kicker="Corrections to the job"
          title="Log"
          size="h2"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-4">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.25em]"
                >
                  {year.year}
                </a>
              ))}
            </nav>
          }
        />
        <div data-scene-section className="mt-8">
          {years.map((year) => (
            <section
              key={year.year}
              aria-labelledby={`log-${year.year}`}
              className="grid gap-x-6 border-t-2 border-ink md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-8 pt-4 text-h3 tracking-[-0.02em]"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-5 gap-y-1 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_7rem] sm:items-baseline"
                  >
                    <time dateTime={entry.date} className="slug text-ink!">
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
                    <span className="slug sm:text-right">
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
