import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";
import { rfiLabel } from "./rfi-number";

/**
 * Published conversations, filed as slips in the tray, latest activity first.
 * `startNumber` is the RFI number of the first (newest) thread in the list;
 * every thread after it counts down, so numbers never shift as new ones file.
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
    <ol className="border-t border-line">
      {threads.map((thread, i) => (
        <li
          key={thread.id}
          data-scene-item={`rfi:${thread.id}`}
          className="border-b border-line py-8 sm:py-10"
        >
          <ChatThread thread={thread} rfiLabel={rfiLabel(startNumber - i)} />
        </li>
      ))}
    </ol>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center sm:py-14">
      <p className="font-display text-2xl font-normal text-ink">
        It&rsquo;s quiet in the tray, for now.
      </p>
      <p className="mx-auto mt-3 max-w-[42ch] text-ink-soft">
        Ask about something I built, how I work, or anything on your mind. The
        first RFI could be yours.
      </p>
      <a
        href="#start"
        className="mt-6 inline-flex min-h-11 items-center font-mono text-mono-xs tracking-[0.1em] text-ink uppercase hover:text-accent"
      >
        Submit an RFI &uarr;
      </a>
    </div>
  );
}
