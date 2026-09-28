import Link from "next/link";
import { NowItem } from "@/flavors/mission/components/now/now-item";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import { pad2 } from "@/flavors/mission/lib/flight";

import { askEntryHref } from "@/lib/ask/format";
import type { Now, Question } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

/** The latest status report, and the newest transmission on the capcom loop. */
export function StatusReport({
  now,
  question,
}: {
  now: Now;
  question: Question | null;
}) {
  return (
    <section aria-labelledby="status-heading">
      <SectionHead
        id="status-heading"
        number="3.0"
        title="Status report"
        aside={`Filed ${formatDate(now.updatedAt)}`}
      />
      <div className="mt-10 grid gap-x-6 gap-y-10 lg:grid-cols-12">
        <ol className="lg:col-span-7">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline border-b border-rule py-4 first:pt-0"
            >
              <span className="label font-semibold">SR-{pad2(i + 1)}</span>
              <p className="text-[1.125rem] leading-snug">
                <NowItem item={item} />
              </p>
            </li>
          ))}
          <li className="pt-3">
            <Link
              href="/now"
              className="rule-link inline-flex min-h-11 items-center font-display font-bold"
            >
              Every status report
            </Link>
          </li>
        </ol>
        {question ? (
          <aside
            aria-labelledby="capcom-heading"
            className="self-start border-t-2 border-signal pt-4 lg:col-span-4 lg:col-start-9"
          >
            <h3 id="capcom-heading" className="label text-signal">
              Capcom · latest transmission
            </h3>
            <p className="mt-3 line-clamp-4 text-lg leading-snug [overflow-wrap:anywhere] whitespace-pre-line">
              {question.body}
            </p>
            <p className="mt-3 flex flex-wrap gap-x-5">
              <Link
                href={askEntryHref(question.slug)}
                className="rule-link inline-flex min-h-11 items-center font-medium"
              >
                Read the transcript
              </Link>
              <Link
                href="/ask"
                className="rule-link inline-flex min-h-11 items-center text-ink-soft"
              >
                Open a channel
              </Link>
            </p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
