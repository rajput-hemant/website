"use client";

import {
  usePendingReplies,
  usePendingThreads,
} from "@/components/semantic/ask/pending-messages";

import { visitorName } from "./labels";
import { Message } from "./message";

/** The sender's own new queries waiting for approval, above the sleeves. */
export function PendingThreads({
  publishedSlugs,
}: {
  publishedSlugs: readonly string[];
}) {
  const threads = usePendingThreads(publishedSlugs);
  if (threads.length === 0) return null;
  return (
    <ol
      aria-label="Your questions awaiting approval"
      className="grid gap-8 pb-10"
    >
      {threads.map((thread) => (
        <li key={`${thread.slug}-${thread.createdAt}`}>
          <Message
            by="visitor"
            size="lead"
            pending
            name={visitorName(thread.authorName)}
            body={thread.body}
            createdAt={thread.createdAt}
          />
        </li>
      ))}
    </ol>
  );
}

/** The sender's own replies in one thread waiting for approval, in place. */
export function PendingReplies({
  slug,
  publishedKeys,
  itemClass,
}: {
  slug: string;
  publishedKeys: readonly string[];
  itemClass: string;
}) {
  const replies = usePendingReplies(slug, publishedKeys);
  return replies.map((reply) => (
    <li key={reply.key ?? reply.createdAt} className={itemClass}>
      <Message
        by="visitor"
        pending
        name={visitorName(reply.authorName)}
        body={reply.body}
        createdAt={reply.createdAt}
      />
    </li>
  ));
}
