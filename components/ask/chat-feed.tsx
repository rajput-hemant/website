import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";

/** Published conversations, filed as slips in the tray, latest activity first. */
export function ChatFeed({ threads }: { threads: Question[] }) {
  if (threads.length === 0) return <EmptyFeed />;

  return (
    <ol className="border-t border-hairline">
      {threads.map((thread) => (
        <li key={thread.id} className="border-b border-hairline py-8 sm:py-10">
          <ChatThread thread={thread} />
        </li>
      ))}
    </ol>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-md border border-dashed border-rule px-6 py-12 text-center sm:py-14">
      <p className="font-display text-2xl font-normal text-paper">
        It&rsquo;s quiet in the tray, for now.
      </p>
      <p className="mx-auto mt-3 max-w-[42ch] text-graphite">
        Ask about something I built, how I work, or anything on your mind. The
        first slip could be yours.
      </p>
      <a
        href="#start"
        className="mt-6 inline-flex min-h-11 items-center font-mono text-mono-xs tracking-[0.1em] text-paper uppercase hover:text-accent"
      >
        Start a conversation &uarr;
      </a>
    </div>
  );
}
