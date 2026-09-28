import type { Metadata } from "next";
import { Face } from "@/flavors/calibre/components/dial/face";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { linkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { SectionHead } from "@/flavors/calibre/components/ui/section-head";
import { bezelPrints, pad2 } from "@/flavors/calibre/lib/movement";

import { sitePage } from "@/content/site";
import { getChangelog, getNow, getProfile, getProjects } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { hrefProps } from "@/lib/safe-href";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** The rate log: what is on the bench now, then every dated regulation entry, by year. */
export default async function NowPage() {
  const [now, changelog, profile, projects] = await Promise.all([
    getNow(),
    getChangelog(),
    getProfile(),
    getProjects(),
  ]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <PageHeader
        hour={null}
        kicker="Rate log"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Regulated", value: formatDate(now.updatedAt) },
          { label: "Log entries", value: String(changelog.length) },
        ]}
        prints={bezelPrints(projects.length, profile.location)}
        dial={<Face figure={changelog.length} unit="Log entries" />}
      />

      <Container
        as="section"
        aria-labelledby="line-heading"
        className="mt-section"
      >
        <SectionHead id="line-heading" kicker="On the bench" title="Now" />
        <ol className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-3 border-b border-line py-5"
            >
              <span
                aria-hidden
                className="numeral-italic text-[1.5rem] text-soft"
              >
                {pad2(i + 1)}
              </span>
              <p className="text-lead">
                {item.link ? (
                  <a {...hrefProps(item.link)} className={linkClass}>
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
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
          kicker="Dated regulation entries, by year"
          title="Log"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-4">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className={`inline-flex min-h-11 items-center font-medium ${linkClass}`}
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
                className="scroll-mt-8 pt-4 numeral-italic text-[1.75rem]"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-5 gap-y-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_7rem] sm:items-baseline"
                  >
                    <time dateTime={entry.date} className="spec text-ink!">
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
                    <span className="spec sm:text-right">
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
