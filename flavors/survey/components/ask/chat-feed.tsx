import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";
import { entryLabel } from "./entry-number";

/**
 * Published conversations as notebook entries, latest activity first.
 * `startNumber` is the newest entry's number; the rest count down, so
 * numbers never shift as new ones are made.
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
    <ol className="border-t border-rule-strong">
      {threads.map((thread, i) => {
        const label = entryLabel(startNumber - i);
        return (
          <li
            key={thread.id}
            data-scene-item={`entry:${thread.id}`}
            data-scene-label={`${label}|${thread.replies.length} ${thread.replies.length === 1 ? "reply" : "replies"}`}
            className="border-b border-rule py-8 sm:py-10"
          >
            <ChatThread thread={thread} label={label} />
          </li>
        );
      })}
    </ol>
  );
}

function EmptyFeed() {
  return (
    <div className="border border-rule bg-sheet px-6 py-12 text-center sm:py-14">
      <p className="spaced text-h3">A blank page</p>
      <p className="mx-auto mt-4 max-w-[42ch] text-ink-soft">
        Ask about something I built, how I work, or anything on your mind. The
        first entry in the notebook could be yours.
      </p>
      <a
        href="#start"
        className="caps mt-6 inline-flex min-h-11 items-center gap-2 text-water underline underline-offset-[0.4em]"
      >
        Ask a question <span aria-hidden>↑</span>
      </a>
    </div>
  );
}
