"use client";

import { ITEM } from "@/flavors/press/lib/scene/views";
import { cn } from "@/flavors/press/lib/utils";

import {
  usePendingReplies,
  usePendingThreads,
} from "@/components/semantic/ask/pending-messages";

import { Message } from "./message";

/** The sender's own new queries waiting for approval, fed onto the sheet (`.feed-in`). */
export function PendingThreads({
  publishedSlugs,
}: {
  publishedSlugs: readonly string[];
}) {
  const threads = usePendingThreads(publishedSlugs);
  if (threads.length === 0) return null;
  return (
    <ol
      aria-label="Your queries awaiting approval"
      className="grid gap-8 pb-10"
    >
      {threads.map((thread) => (
        <li
          key={`${thread.slug}-${thread.createdAt}`}
          data-scene-item={`${ITEM.pending}:${thread.slug}`}
          className="feed-in"
        >
          <Message
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
    <li key={reply.key ?? reply.createdAt} className={cn("feed-in", itemClass)}>
      <Message
        by="visitor"
        pending
        authorName={reply.authorName}
        body={reply.body}
        createdAt={reply.createdAt}
      />
    </li>
  ));
}
