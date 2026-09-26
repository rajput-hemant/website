import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";
import { queueLabel } from "./queue-number";

/**
 * Published conversations, latest activity first. `startNumber` is the queue
 * number of the first (newest) thread in the list; every thread after it
 * counts down, so numbers never shift as new ones arrive. Each thread is a
 * detent on the page's knob.
 */
export function ChatFeed({
  threads,
  startNumber,
}: {
  threads: Question[];
  startNumber: number;
}) {
  if (threads.length === 0) return <EmptyFeed />;

  return (
    <ol className="seam-t">
      {threads.map((thread, i) => (
        <li
          key={thread.id}
          data-knob-item={i}
          className="seam-b scroll-mt-[calc(var(--header-height)+2rem)] py-8 sm:py-10"
        >
          <ChatThread thread={thread} queue={queueLabel(startNumber - i)} />
        </li>
      ))}
    </ol>
  );
}

function EmptyFeed() {
  return (
    <div className="mod px-6 py-12 text-center sm:py-14">
      <p className="font-display text-h3 text-ink">
        The queue is empty, for now.
      </p>
      <p className="mx-auto mt-3 max-w-[42ch] text-ink-2">
        Ask about something I built, how I work, or anything on your mind. The
        first question could be yours.
      </p>
      <a href="#start" className="key mt-6">
        Ask a question
      </a>
    </div>
  );
}
