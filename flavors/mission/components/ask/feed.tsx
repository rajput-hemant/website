import type { Question } from "@/lib/data/types";

import { sampleLabel } from "./labels";
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
      <div className="bg-panel px-6 py-12 text-center shadow-card">
        <p className="text-h3 font-medium">No transmissions on the loop yet.</p>
        <p className="mx-auto mt-3 max-w-[42ch] text-ink-soft">
          Ask about something I built, how I work, or anything on your mind. The
          first question could be yours.
        </p>
        <a
          href="#start"
          className="rule-link mt-6 inline-flex min-h-11 items-center font-medium"
        >
          Ask a question
        </a>
      </div>
    );
  }
  return (
    <ol className="grid items-start gap-x-7 gap-y-9 md:grid-cols-2">
      {threads.map((thread, i) => (
        <li
          key={thread.id}
          data-scene-item={`question:${thread.id}`}
          className="relative min-w-0 rounded-none bg-panel px-5 pt-6 pb-4 shadow-card sm:px-6"
        >
          <i
            aria-hidden
            className="absolute -top-1.5 left-6 size-3 rounded-full bg-signal shadow-[0_2px_0_rgb(0_0_0/0.25)]"
          />
          <Thread thread={thread} label={sampleLabel(startNumber - i)} />
        </li>
      ))}
    </ol>
  );
}
