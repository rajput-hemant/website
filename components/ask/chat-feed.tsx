import { type Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";

/** Published conversations, latest activity first. */
export function ChatFeed({ threads }: { threads: Question[] }) {
  if (threads.length === 0) return <EmptyFeed />;

  return (
    <ol className="stagger border-t border-hairline">
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
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center sm:py-14">
      <p className="display text-2xl font-book text-foreground">
        It&rsquo;s quiet in here, for now.
      </p>
      <p className="mx-auto mt-3 max-w-[42ch] text-muted">
        Ask about something I built, how I work, or anything on your mind. The
        first conversation could be yours.
      </p>
      <a
        href="#start"
        className="mt-6 inline-flex link meta text-foreground hover:text-accent"
      >
        Start a conversation ↑
      </a>
    </div>
  );
}
