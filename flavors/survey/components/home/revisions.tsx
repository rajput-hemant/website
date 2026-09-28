import Link from "next/link";
import { entryLabel } from "@/flavors/survey/components/ask/entry-number";
import { cn } from "@/flavors/survey/lib/utils";

import type { Now, Question, Update } from "@/lib/data/types";
import { formatDate, formatShortDate } from "@/lib/format";

/**
 * What changed since the last edition: the current position as revision
 * notes in purple, the latest log entries, and the newest notebook entry.
 */
export function Revisions({
  now,
  log,
  question,
  total,
}: {
  now: Now;
  log: Update[];
  question: Question | null;
  total: number;
}) {
  return (
    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="caps text-revision">
          Revised {formatDate(now.updatedAt)}
        </p>
        <ol className="mt-4 grid gap-4">
          {now.items.map((item) => (
            <li
              key={item.text}
              className="border-l-2 border-revision pl-4 font-serif text-lead"
            >
              {item.link ? (
                <a
                  href={item.link}
                  className="underline decoration-revision/50 underline-offset-[0.3em] fine:hover:text-revision"
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ol>
        <ul className="mt-8 border-t border-rule">
          {log.map((entry) => (
            <li
              key={entry.id}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3 text-sm"
            >
              <time
                dateTime={entry.date}
                className="caps pt-0.5 text-ink-faint"
              >
                {formatShortDate(entry.date)}
              </time>
              <span>{entry.text}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/now#log"
          className="mt-4 inline-flex min-h-11 items-center font-medium underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
        >
          Every revision note
        </Link>
      </div>
      <aside
        aria-labelledby="notebook-heading"
        className="border border-rule-strong p-5 lg:col-span-5 lg:self-start"
      >
        <h3 id="notebook-heading" className="caps">
          From the field notebook
        </h3>
        {question ? (
          <>
            <p className="caps mt-4 text-ink-faint">{entryLabel(total)}</p>
            <blockquote
              className={cn(
                "mt-2 line-clamp-5 font-serif text-statement italic",
                "[overflow-wrap:anywhere]"
              )}
            >
              {question.body}
            </blockquote>
            <Link
              href={`/ask/${question.slug}`}
              className="mt-4 inline-flex min-h-11 items-center font-medium underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
            >
              Read the entry
            </Link>
          </>
        ) : (
          <p className="mt-4 font-serif text-lead text-ink-soft italic">
            No entries yet. The first question could be yours.
          </p>
        )}
        <p>
          <Link
            href="/ask"
            className="inline-flex min-h-11 items-center font-medium underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
          >
            Write in the notebook
          </Link>
        </p>
      </aside>
    </div>
  );
}
