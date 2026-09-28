import Link from "next/link";
import { NowItem } from "@/flavors/jacquard/components/now/now-item";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { pad2 } from "@/flavors/jacquard/lib/weave";

import { askEntryHref } from "@/lib/ask/format";
import type { Now, Question } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

/** What is on the loom now, and the newest question pinned to the sampler board. */
export function OnTheLoom({
  now,
  question,
}: {
  now: Now;
  question: Question | null;
}) {
  return (
    <section aria-labelledby="loom-heading">
      <SectionHead
        id="loom-heading"
        title="On the loom"
        aside={`Loom log · updated ${formatDate(now.updatedAt)}`}
      />
      <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <ol className="grid">
          {now.items.map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline border-b border-rule py-4 first:pt-0"
            >
              <span className="label">Pick {pad2(i + 1)}</span>
              <p className="text-[1.125rem] leading-snug">
                <NowItem item={item} />
              </p>
            </li>
          ))}
          <li className="pt-3">
            <Link
              href="/now"
              className="thread-link inline-flex min-h-11 items-center font-medium"
            >
              The loom log
            </Link>
          </li>
        </ol>
        {question ? (
          <aside
            aria-labelledby="pinned-heading"
            className="relative self-start rounded-[3px] bg-panel p-5 pt-6 shadow-card"
          >
            <i
              aria-hidden
              className="absolute -top-1.5 left-5 size-3 rounded-full bg-madder shadow-[0_2px_0_rgb(0_0_0/0.25)]"
            />
            <h3 id="pinned-heading" className="label">
              Sampler board · newest question
            </h3>
            <p className="mt-3 line-clamp-4 text-lg leading-snug [overflow-wrap:anywhere] whitespace-pre-line">
              {question.body}
            </p>
            <p className="mt-3 flex flex-wrap gap-x-5">
              <Link
                href={askEntryHref(question.slug)}
                className="thread-link inline-flex min-h-11 items-center font-medium"
              >
                Read the thread
              </Link>
              <Link
                href="/ask"
                className="thread-link inline-flex min-h-11 items-center text-ink-soft"
              >
                Ask something
              </Link>
            </p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
