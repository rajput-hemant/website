import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";
import { noticeLabel } from "./notice-number";

/**
 * Published conversations as notices, latest activity first. `startNumber`
 * is the newest thread's notice number; the rest count down, so numbers
 * never shift as new ones are posted.
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
    <ol className="border-t-[3px] border-rule-strong">
      {threads.map((thread, i) => {
        const label = noticeLabel(startNumber - i);
        return (
          <li
            key={thread.id}
            data-scene-item={`notice:${thread.id}`}
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
    <div className="rounded-lg bg-surface px-6 py-12 text-center shadow-[inset_0_0_0_1.5px_var(--color-rule)] sm:py-14">
      <p className="text-h3 font-extrabold">No notices posted yet.</p>
      <p className="mx-auto mt-3 max-w-[42ch] text-ink-soft">
        Ask about something I built, how I work, or anything on your mind. The
        first notice could be yours.
      </p>
      <a
        href="#start"
        className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-current leading-none font-bold"
      >
        Ask a question <span aria-hidden>↑</span>
      </a>
    </div>
  );
}
