import Link from "next/link";
import { NowItem } from "@/flavors/press/components/now/now-item";
import { SectionHead } from "@/flavors/press/components/ui/section-head";
import { route } from "@/flavors/press/lib/utils";

import { askEntryHref } from "@/lib/ask/format";
import type { Now, Question } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

/** The latest proof, marked in yellow: what is current, and the newest query on the corrections sheet. */
export function LatestProof({
  now,
  question,
}: {
  now: Now;
  question: Question | null;
}) {
  return (
    <section aria-labelledby="latest-heading">
      <SectionHead
        id="latest-heading"
        kicker="Sheet 06 / Latest proof"
        title="Now"
        aside={<span>Proofed {formatDate(now.updatedAt)}</span>}
      />
      <div className="mt-10 grid gap-x-6 gap-y-10 lg:grid-cols-12">
        <ol className="grid gap-3 lg:col-span-7">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-t border-rule pt-3"
            >
              <span className="slug">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-lead leading-snug">
                <NowItem item={item} />
              </p>
            </li>
          ))}
          <li>
            <Link
              href="/now"
              className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em] fine:hover:decoration-blue"
            >
              The full proof and the log
            </Link>
          </li>
        </ol>
        {question ? (
          <aside
            aria-labelledby="query-heading"
            className="crop-marks self-start bg-sheet p-5 shadow-sheet lg:col-span-4 lg:col-start-9"
          >
            <h3 id="query-heading" className="slug">
              Corrections sheet &nbsp;/&nbsp; latest query
            </h3>
            <p className="mt-3 line-clamp-4 text-lead leading-snug font-semibold [overflow-wrap:anywhere] whitespace-pre-line">
              {question.body}
            </p>
            <p className="mt-4 flex flex-wrap gap-x-5">
              <Link
                href={route(askEntryHref(question.slug))}
                className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em]"
              >
                Read the thread
              </Link>
              <Link
                href="/ask"
                className="inline-flex min-h-11 items-center font-bold underline decoration-rule decoration-2 underline-offset-[0.3em]"
              >
                Send a query
              </Link>
            </p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
