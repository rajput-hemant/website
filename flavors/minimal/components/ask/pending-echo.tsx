"use client";

import { ChatBubble } from "./chat-bubble";
import { usePendingReplies, usePendingThreads } from "./pending-messages";
import { threadItemClass } from "./thread-line";

/** The sender's own new threads that are waiting for approval, above the feed. */
export function PendingThreads({
  publishedSlugs,
}: {
  publishedSlugs: readonly string[];
}) {
  const threads = usePendingThreads(publishedSlugs);
  if (threads.length === 0) return null;

  return (
    <ol
      aria-label="Your messages awaiting approval"
      className="grid gap-8 pb-10"
    >
      {threads.map((thread) => (
        <li key={`${thread.slug}-${thread.createdAt}`}>
          <ChatBubble
            by="visitor"
            size="lead"
            pending
            authorName={thread.authorName}
            body={thread.body}
            createdAt={thread.createdAt}
          />
        </li>
      ))}
    </ol>
  );
}

/** The sender's own replies in one thread that are waiting for approval, in place. */
export function PendingReplies({
  slug,
  publishedKeys,
}: {
  slug: string;
  publishedKeys: readonly string[];
}) {
  const replies = usePendingReplies(slug, publishedKeys);

  return replies.map((reply) => (
    <li key={reply.key ?? reply.createdAt} className={threadItemClass}>
      <ChatBubble
        by="visitor"
        pending
        authorName={reply.authorName}
        body={reply.body}
        createdAt={reply.createdAt}
      />
    </li>
  ));
}
