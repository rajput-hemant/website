import Link from "next/link";
import { SectionHead } from "@/flavors/timetable/components/ui/section-head";

import { excerpt } from "@/lib/ask/format";
import type { Now, Question } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

/**
 * Service updates: what I'm on right now, posted like station notices, and
 * the latest answer from the information desk.
 */
export function ServiceUpdates({
  now,
  question,
}: {
  now: Now;
  question: Question | null;
}) {
  const answer = question?.replies.find((reply) => reply.by === "owner");
  return (
    <section aria-labelledby="updates-heading">
      <SectionHead
        id="updates-heading"
        platform="5"
        kicker="Now"
        title="Service updates"
        aside={
          <>
            Updated{" "}
            <time dateTime={now.updatedAt}>{formatDate(now.updatedAt)}</time>
          </>
        }
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <ol className="grid content-start gap-3 lg:col-span-7">
          {now.items.slice(0, 4).map((item, i) => (
            <li
              key={item.text}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-4 rounded-md bg-surface px-5 py-4 shadow-[inset_4px_0_0_var(--color-signal)]"
            >
              <span className="font-mono text-mono-sm font-bold text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-base leading-snug">
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
          <li>
            <Link
              href="/now"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current text-base leading-none font-bold"
            >
              All service updates <span aria-hidden>→</span>
            </Link>
          </li>
        </ol>

        <aside
          aria-labelledby="desk-heading"
          className="self-start rounded-lg border-[1.5px] border-rule-strong p-6 lg:col-span-5"
        >
          <h3
            id="desk-heading"
            className="flex items-center gap-2.5 text-h3 font-extrabold tracking-[-0.015em]"
          >
            <span
              aria-hidden
              className="grid size-6 place-items-center rounded-[3px] bg-ink pt-0.5 text-sm font-extrabold text-ground"
            >
              i
            </span>
            Information desk
          </h3>
          {question ? (
            <>
              <p className="mt-4 text-lead leading-snug font-semibold">
                “{excerpt(question.body, 140)}”
              </p>
              {answer ? (
                <p className="mt-3 text-ink-soft">
                  {excerpt(answer.body, 200)}
                </p>
              ) : null}
              <Link
                href={`/ask/${question.slug}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 border-b-2 border-current leading-none font-bold"
              >
                Read the notice <span aria-hidden>→</span>
              </Link>
            </>
          ) : (
            <p className="mt-4 text-ink-soft">
              No notices posted yet. Questions, comments and hellos are read by
              hand before they appear.
            </p>
          )}
          <p className="mt-5 border-t border-rule pt-4">
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center gap-2 leading-none font-bold underline decoration-rule-strong decoration-2 underline-offset-[0.3em] fine:hover:decoration-ink"
            >
              Ask a question
            </Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
