import type { Metadata } from "next";
import { Panel } from "@/flavors/surface/components/site/panel";
import {
  ExternalLink,
  Legend,
} from "@/flavors/surface/components/ui/primitives";
import { pad2 } from "@/flavors/surface/components/ui/seg";

import { sitePage } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { updateCategoryLabels } from "@/lib/data/labels";
import { formatDate, formatShortDate, toDateTime } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

/** What I'm on now, then the log: every change, a dot-matrix printout per year. */
export default async function NowPage() {
  const [now, changelog] = await Promise.all([getNow(), getChangelog()]);
  const years = groupByYear(changelog);

  return (
    <Panel
      ch="05"
      name="Now"
      aside={
        <>
          Updated{" "}
          <time dateTime={now.updatedAt}>{formatDate(now.updatedAt)}</time>
        </>
      }
      title="Now"
      lede={page.description}
      knob={
        years.length > 0
          ? {
              items: [
                { label: "Now", href: "#now" },
                ...years.map((year) => ({
                  label: `Log ${year.year}`,
                  href: `#log-${year.year}`,
                })),
              ],
              unit: "Page",
              label: "Log selector",
            }
          : undefined
      }
    >
      <section
        id="now"
        data-knob-item={0}
        aria-labelledby="now-title"
        className="mod scroll-mt-[calc(var(--header-height)+1.5rem)] p-2.5"
      >
        <h2 id="now-title" className="legend px-2.5 pt-1.5 pb-3">
          Current focus
        </h2>
        <ol className="glass grid gap-3.5 px-5 py-5">
          {now.items.map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[2.25rem_1fr] gap-2 text-lead leading-snug"
            >
              <span
                aria-hidden
                className="matrix pt-1 text-[0.9375rem] text-lcd-ink-2"
              >
                {pad2(i + 1)}
              </span>
              <span>
                {item.link ? (
                  <ExternalLink href={item.link}>{item.text}</ExternalLink>
                ) : (
                  item.text
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="log"
        aria-labelledby="log-title"
        className="mt-section scroll-mt-[calc(var(--header-height)+1.5rem)]"
      >
        <div className="seam-b pb-4">
          <Legend>Channel 05 &nbsp;·&nbsp; {changelog.length} entries</Legend>
          <h2 id="log-title" className="mt-3 text-h2 tracking-[-0.016em]">
            The log
          </h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">
            A running record of what changed: work, projects, this site, and the
            odd bit of life.
          </p>
        </div>

        <div className="mt-10 grid gap-10">
          {years.map((year, y) => (
            <section
              key={year.year}
              id={`log-${year.year}`}
              data-knob-item={y + 1}
              aria-labelledby={`log-${year.year}-title`}
              className="scroll-mt-[calc(var(--header-height)+1.5rem)]"
            >
              <h3 id={`log-${year.year}-title`} className="legend mb-3">
                {year.year} &nbsp;·&nbsp; {year.entries.length}{" "}
                {year.entries.length === 1 ? "entry" : "entries"}
              </h3>
              <ol className="glass divide-y divide-lcd-ink-2/25 px-5">
                {year.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[7rem_6rem_minmax(0,1fr)]"
                  >
                    <time
                      dateTime={toDateTime(entry.date)}
                      className="matrix text-[0.875rem] leading-snug"
                    >
                      {formatShortDate(entry.date)}
                    </time>
                    <span className="legend self-center text-[0.625rem]">
                      {updateCategoryLabels[entry.category]}
                    </span>
                    <p className="leading-snug">
                      {entry.link ? (
                        <ExternalLink href={entry.link}>
                          {entry.text}
                        </ExternalLink>
                      ) : (
                        entry.text
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </Panel>
  );
}
