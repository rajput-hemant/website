import type { Metadata } from "next";
import { NowItem } from "@/flavors/mission/components/now/now-item";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import { elapsed, flightPlan, pad2 } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getChangelog, getExperience, getNow, getProjects } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate, monthIndex } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** The current status report, then the log: every entry dated by calendar and by mission time. */
export default async function NowPage() {
  const [now, changelog, experience, projects] = await Promise.all([
    getNow(),
    getChangelog(),
    getExperience(),
    getProjects(),
  ]);
  const flight = flightPlan(experience, projects, new Date());
  const years = groupByYear(changelog);
  const met = (date: string) => {
    const t = monthIndex(date) - flight.t0;
    return t < 0 ? "Pre-launch" : elapsed(t);
  };

  return (
    <Page>
      <PageHeader
        section={6}
        kicker="Status report"
        title={page.title}
        lede={page.description}
        meta={[
          {
            label: "Filed",
            value: formatDate(now.updatedAt),
            nominal: true,
          },
          { label: "Mission time", value: met(now.updatedAt) },
          { label: "Log", value: `${changelog.length} entries` },
        ]}
        scene={{
          route: "now",
          board: boardFor(flight),
          caption: "The orbits in phase as this report was filed.",
        }}
      />

      <Container
        as="section"
        aria-labelledby="current-heading"
        className="mt-section"
      >
        <SectionHead
          id="current-heading"
          number="6.1"
          title="Current status"
          size="h2"
        />
        <ol className="mt-2 grid gap-x-6 md:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline border-b border-rule py-5"
            >
              <span className="label font-semibold">SR-{pad2(i + 1)}</span>
              <p className="text-[1.1875rem] leading-snug">
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
          number="6.2"
          title="Mission log"
          size="h2"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-5">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className="rule-link inline-flex min-h-11 items-center font-mono text-sm"
                >
                  {year.year}
                </a>
              ))}
            </nav>
          }
        />
        <div>
          {years.map((year) => (
            <section
              key={year.year}
              aria-labelledby={`log-${year.year}`}
              className="grid gap-x-6 border-b border-rule-strong md:grid-cols-12"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-8 pt-5 pb-2 text-h3 md:col-span-2"
              >
                {year.year}
              </h3>
              <ol className="md:col-span-10">
                {year.entries.map((entry) => {
                  const n = changelog.length - changelog.indexOf(entry);
                  return (
                    <li
                      key={entry.id}
                      className="grid gap-x-5 gap-y-1.5 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[5.5rem_6.5rem_minmax(0,1fr)_7.5rem] sm:items-baseline"
                    >
                      <time
                        dateTime={entry.date}
                        className="font-mono text-sm text-ink-soft"
                      >
                        {formatShortDate(entry.date)}
                      </time>
                      <span className="label">{met(entry.date)}</span>
                      <p className="leading-snug">
                        {entry.link ? (
                          <a href={entry.link} className="rule-link">
                            {entry.text}
                          </a>
                        ) : (
                          entry.text
                        )}
                      </p>
                      <span className="label sm:text-right">
                        {updateCategoryLabels[entry.category]}
                        <span className="sr-only">,</span> · LOG-{pad2(n)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </Container>
    </Page>
  );
}
