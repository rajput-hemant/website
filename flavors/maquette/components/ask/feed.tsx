import type { Question } from "@/lib/data/types";

import { sleeveLabel } from "./labels";
import { Thread } from "./thread";

/** Published threads, latest activity first. Numbers count down from `startNumber`, so they never shift. */
export function Feed({
  threads,
  startNumber,
}: {
  threads: Question[];
  startNumber: number;
}) {
  if (threads.length === 0) {
    return (
      <div className="rounded-[3px] bg-raise px-6 py-12 text-center shadow-vitrine ring-1 ring-line">
        <p className="text-[1.625rem] leading-tight font-bold tracking-[-0.03em]">
          No comment cards on the model yet.
        </p>
        <p className="mx-auto mt-3 max-w-[42ch] text-soft">
          Ask about something I built, how I work, or anything on your mind. The
          first question could be yours.
        </p>
        <a
          href="#start"
          className="mt-6 inline-flex min-h-11 items-center font-bold underline decoration-cut decoration-2 underline-offset-[0.3em]"
        >
          Ask a question
        </a>
      </div>
    );
  }
  return (
    <ol className="grid gap-5">
      {threads.map((thread, i) => (
        <li
          key={thread.id}
          data-scene-item={`card:${thread.id}`}
          className="comment-card rounded-[2px] px-4 py-6 sm:px-7 sm:py-8"
        >
          <Thread thread={thread} label={sleeveLabel(startNumber - i)} />
        </li>
      ))}
    </ol>
  );
}
