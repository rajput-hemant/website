import { Disclosure } from "@/flavors/survey/components/ui/disclosure";
import { cn } from "@/flavors/survey/lib/utils";

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
 * One notebook entry: the opening question, its published replies tied on by
 * the survey line, the sender's own pending replies, and the reply row. In
 * the feed the replies fold behind an "N replies" toggle; the permalink page
 * shows them all.
 */
export function ChatThread({
  thread,
  label,
  standalone = false,
}: {
  thread: Question;
  /** `Entry 014`; omitted for the sender's own not-yet-published echo. */
  label?: string;
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
      {label && (
        <p className="mb-3 flex flex-wrap items-center gap-3">
          <span className="spaced text-sm text-ink">{label}</span>
          <span
            className={cn(
              "caps rounded-sm px-1.5 py-0.5",
              answered
                ? "bg-revision text-sheet"
                : "border border-contour text-contour-ink"
            )}
          >
            {answered ? "Answered" : "Awaiting an answer"}
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
            <Disclosure
              summary={repliesLabel(replies.length)}
              // Starts on the survey line so the replies' ticks sit inside
              // the box that clips the open/close animation.
              className="-ml-4 min-w-0 sm:-ml-6"
              summaryClassName="caps ml-4 w-fit text-ink-soft transition-colors fine:hover:text-water sm:ml-6"
              contentClassName="pl-4 sm:pl-6"
            >
              <ol className="grid">
                {replies.map((reply) => (
                  <li key={reply.key} className={threadElbowClass}>
                    {reply.bubble}
                  </li>
                ))}
              </ol>
            </Disclosure>
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
