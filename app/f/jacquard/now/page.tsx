import type { Metadata } from "next";
import { NowItem } from "@/flavors/jacquard/components/now/now-item";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { logWeave } from "@/flavors/jacquard/lib/scene/poses";
import { cn } from "@/flavors/jacquard/lib/utils";
import { categoryYarn, pad2, yarnClass } from "@/flavors/jacquard/lib/weave";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { hrefProps } from "@/lib/safe-href";

const page = sitePage("/now");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** What is on the loom now, then the loom log: one pick added per entry, by year. */
export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const years = groupByYear(changelog);

  return (
    <Page>
      <PageHeader
        card={6}
        kicker="Loom log"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Updated", value: formatDate(now.updatedAt) },
          { label: "Log", value: `${changelog.length} picks woven` },
        ]}
        scene={{
          route: "now",
          weave: logWeave(changelog),
          caption:
            "The log as cloth: one pick per entry, newest at the rod, in its category's yarn.",
        }}
      />

      <Container
        as="section"
        aria-labelledby="current-heading"
        className="mt-section"
      >
        <SectionHead id="current-heading" title="On the loom" size="h2" />
        <ol className="mt-2 grid gap-x-10 md:grid-cols-2">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline border-b border-rule py-5"
            >
              <span className="label">Pick {pad2(i + 1)}</span>
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
          title="The log"
          size="h2"
          action={
            <nav aria-label="Years" className="flex flex-wrap gap-x-5">
              {years.map((year) => (
                <a
                  key={year.year}
                  href={`#log-${year.year}`}
                  className="thread-link inline-flex min-h-11 items-center font-mono text-sm"
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
              className="grid gap-x-10 border-b border-rule-strong md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <h3
                id={`log-${year.year}`}
                className="scroll-mt-8 pt-5 pb-2 text-h3"
              >
                {year.year}
              </h3>
              <ol>
                {year.entries.map((entry) => {
                  const n = changelog.length - changelog.indexOf(entry);
                  return (
                    <li
                      key={entry.id}
                      className={cn(
                        "grid gap-x-5 gap-y-1.5 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_8rem] sm:items-baseline",
                        yarnClass[categoryYarn[entry.category]]
                      )}
                    >
                      <time
                        dateTime={entry.date}
                        className="font-mono text-sm text-ink-soft"
                      >
                        {formatShortDate(entry.date)}
                      </time>
                      <p className="leading-snug">
                        {entry.link ? (
                          <a {...hrefProps(entry.link)} className="thread-link">
                            {entry.text}
                          </a>
                        ) : (
                          entry.text
                        )}
                      </p>
                      <span className="flex items-center gap-2.5 label sm:justify-end">
                        <i
                          aria-hidden
                          className="yarn h-[5px] w-6 rounded-[3px]"
                        />
                        <span>
                          {updateCategoryLabels[entry.category]}
                          <span className="sr-only">,</span> · {pad2(n)}
                        </span>
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
