import type { Question } from "@/lib/data/types";

import { CommentCard, isAnswered } from "./card";
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
      <div className="rounded-[2px] bg-foam/60 px-6 py-12 text-center shadow-[inset_0_0_0_1px_var(--color-piece-edge)]">
        <p className="caps">Card 001 is still blank</p>
        <p className="mt-3 font-display text-[1.625rem] leading-tight font-light tracking-[-0.02em]">
          No comment cards on the model yet.
        </p>
        <p className="mx-auto mt-3 max-w-[42ch] text-soft">
          Ask about something I built, how I work, or anything on your mind. The
          first question could be yours.
        </p>
        <a
          href="#start"
          className="mt-6 inline-flex min-h-11 items-center font-semibold underline decoration-cut decoration-2 underline-offset-[0.3em]"
        >
          Ask a question
        </a>
      </div>
    );
  }
  return (
    <ol className="grid gap-5">
      {threads.map((thread, i) => (
        <CommentCard
          as="li"
          key={thread.id}
          data-scene-item={`card:${thread.id}`}
          answered={isAnswered(thread)}
        >
          <Thread thread={thread} label={sleeveLabel(startNumber - i)} />
        </CommentCard>
      ))}
    </ol>
  );
}
