import type { Question } from "@/lib/data/types";

import { queryLabel } from "./labels";
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
      <div className="crop-marks bg-sheet px-6 py-12 text-center shadow-sheet">
        <p className="text-h3 font-black">No queries on the sheet yet.</p>
        <p className="mx-auto mt-3 max-w-[42ch] text-ink-soft">
          Ask about something I built, how I work, or anything on your mind. The
          first query could be yours.
        </p>
        <a
          href="#start"
          className="mt-6 inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em]"
        >
          Send a query
        </a>
      </div>
    );
  }
  return (
    <ol className="border-t-2 border-ink">
      {threads.map((thread, i) => (
        <li
          key={thread.id}
          data-scene-item={`query:${thread.id}`}
          className="border-b border-rule py-8 sm:py-10"
        >
          <Thread thread={thread} label={queryLabel(startNumber - i)} />
        </li>
      ))}
    </ol>
  );
}
