import { Led } from "@/flavors/surface/components/ui/primitives";

import { site } from "@/content/site";
import { askEntryHref } from "@/lib/ask/format";
import { type Question } from "@/lib/data/types";

import { ChatBubble, visitorName } from "./chat-bubble";
import { MessageMenu } from "./message-menu";
import { PendingReplies } from "./pending-echo";
import {
  threadElbowClass,
  threadItemClass,
  threadListClass,
} from "./thread-line";
import { ThreadReply } from "./thread-reply";

const repliesLabel = (count: number) =>
  count === 1 ? "1 reply" : `${count} replies`;

/**
 * One conversation: the opening message, its published replies joined by the
 * patch cable, the sender's own pending replies, and the reply row. In the
 * feed the published replies fold behind an "N replies" toggle; the permalink
 * page shows them all.
 */
export function ChatThread({
  thread,
  queue,
  standalone = false,
}: {
  thread: Question;
  /** `Q 014`; omitted for the sender's own not-yet-published echo. */
  queue?: string;
  /** On the permalink page: no self-links, and the reply composer starts open. */
  standalone?: boolean;
}) {
  const href = askEntryHref(thread.slug);
  const starter =
    thread.by === "owner" ? site.handle : visitorName(thread.authorName);
  const answered = thread.replies.some((reply) => reply.by === "owner");
  const replies = thread.replies.map((reply) => ({
    key: reply.key,
    bubble: (
      <ChatBubble
        by={reply.by}
        authorName={reply.authorName}
        body={reply.body}
        createdAt={reply.createdAt}
        actions={
          reply.by === "visitor" && (
            <MessageMenu
              slug={thread.slug}
              target={reply.key}
              label={`reply from ${visitorName(reply.authorName)}`}
            />
          )
        }
      />
    ),
  }));

  return (
    <article className="min-w-0">
      {queue && (
        <p className="legend mb-3 flex items-center gap-2.5">
          <span className="text-ink">{queue}</span>
          <span aria-hidden>&middot;</span>
          <span className="inline-flex items-center gap-1.5">
            <Led on={answered} />
            {answered ? "Answered" : "Awaiting a reply"}
          </span>
        </p>
      )}
      <ChatBubble
        by={thread.by}
        size="lead"
        authorName={thread.authorName}
        body={thread.body}
        createdAt={thread.submittedAt}
        href={standalone ? undefined : href}
        actions={
          thread.by === "visitor" && (
            <MessageMenu
              slug={thread.slug}
              target="thread"
              label={`conversation from ${starter}`}
            />
          )
        }
      />

      <ol aria-label="Replies" className={threadListClass}>
        {standalone || thread.replies.length === 0 ? (
          replies.map((reply) => (
            <li key={reply.key} className={threadItemClass}>
              {reply.bubble}
            </li>
          ))
        ) : (
          <li className={threadItemClass}>
            <details className="group/replies -ml-5 min-w-0 sm:-ml-7">
              <summary className="legend ml-5 flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 transition-colors duration-150 sm:ml-7 fine:hover:text-ink [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-150 group-open/replies:rotate-90"
                >
                  &rsaquo;
                </span>
                {repliesLabel(replies.length)}
              </summary>
              <ol className="grid pl-5 sm:pl-7">
                {replies.map((reply) => (
                  <li key={reply.key} className={threadElbowClass}>
                    {reply.bubble}
                  </li>
                ))}
              </ol>
            </details>
          </li>
        )}
        <PendingReplies
          slug={thread.slug}
          publishedKeys={thread.replies.map((reply) => reply.key)}
        />
        <li className={threadItemClass}>
          <ThreadReply
            slug={thread.slug}
            replyTo={starter}
            href={standalone ? undefined : href}
            defaultOpen={standalone}
          />
        </li>
      </ol>
    </article>
  );
}
