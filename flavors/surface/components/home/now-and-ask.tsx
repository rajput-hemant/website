import Link from "next/link";
import { KeyLink, Legend } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";

import { excerpt } from "@/lib/ask/format";
import type { Now, Question } from "@/lib/data/types";
import { formatDate, formatTimestamp } from "@/lib/format";

/**
 * The two auxiliary channels on home: what I'm doing now as the dot-matrix
 * log, and Ask's queue readout with the latest conversation.
 */
export function NowAndAsk({
  now,
  question,
  answered,
}: {
  now: Now;
  question: Question | null;
  answered: number;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section
        aria-labelledby="now-heading"
        className="mod p-2.5 lg:col-span-7"
      >
        <div className="flex items-baseline justify-between px-2.5 pt-1.5 pb-3">
          <h3 id="now-heading" className="legend">
            Channel 05 &nbsp;·&nbsp; Now
          </h3>
          <Legend as="span">
            Updated{" "}
            <time dateTime={now.updatedAt}>{formatDate(now.updatedAt)}</time>
          </Legend>
        </div>
        <ol className="glass matrix grid gap-3 px-5 py-4 text-[0.9375rem] leading-snug">
          {now.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-2">
              <span aria-hidden className="text-lcd-ink-2">
                {pad2(i + 1)}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
        <div className="px-2.5 pt-3 pb-1">
          <KeyLink href="/now" size="sm">
            Open the log
          </KeyLink>
        </div>
      </section>

      <section
        aria-labelledby="ask-heading"
        className="mod flex flex-col gap-4 p-5 lg:col-span-5"
      >
        <h3 id="ask-heading" className="legend">
          Channel 06 &nbsp;·&nbsp; Ask
        </h3>
        <div className="glass flex items-end justify-between gap-4 px-4 pt-2.5 pb-3">
          <p className="legend">Answered</p>
          <Seg value={pad2(answered)} className="h-9" />
        </div>
        {question ? (
          <figure className="grid gap-2">
            <blockquote className="text-lead leading-snug font-medium">
              <Link
                href={`/ask/${question.slug}`}
                className="underline decoration-ink-3 underline-offset-[0.2em] fine:hover:decoration-ink"
              >
                {excerpt(question.body, 120)}
              </Link>
            </blockquote>
            <figcaption className="legend">
              Latest conversation &nbsp;·&nbsp;{" "}
              <time dateTime={question.lastActivityAt}>
                {formatTimestamp(question.lastActivityAt)}
              </time>
            </figcaption>
          </figure>
        ) : (
          <p className="text-ink-2">
            No conversations yet. Ask about something I built, how I work, or
            anything else.
          </p>
        )}
        <div className="mt-auto">
          <KeyLink href="/ask" size="sm">
            Ask a question
          </KeyLink>
        </div>
      </section>
    </div>
  );
}
