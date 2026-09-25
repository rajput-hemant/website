import { type Question } from "@/lib/data/types";
import { RevealGroup, RevealItem } from "@/components/interaction/reveal";

import { ChatThread } from "./chat-thread";

/** Published conversations, latest activity first. */
export function ChatFeed({ threads }: { threads: Question[] }) {
  if (threads.length === 0) return <EmptyFeed />;

  return (
    <RevealGroup as="ol" className="border-t border-border">
      {threads.map((thread) => (
        <RevealItem
          as="li"
          key={thread.id}
          className="border-b border-border py-10"
        >
          <ChatThread thread={thread} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center sm:py-14">
      <p className="display text-2xl text-foreground">
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
