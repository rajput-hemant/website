import { site } from "@/content/site";
import { type Question } from "@/lib/data/types";

import { ChatBubble, visitorName } from "./chat-bubble";
import { askEntryHref } from "./format";
import { MessageMenu } from "./message-menu";
import { PendingReplies } from "./pending-echo";
import { threadItemClass, threadListClass } from "./thread-line";
import { ThreadReply } from "./thread-reply";

/**
 * One conversation: the opening message, its published replies joined by the
 * thread line, the sender's own pending replies, and the reply row.
 */
export function ChatThread({
  thread,
  standalone = false,
}: {
  thread: Question;
  /** On the permalink page: no self-links, and the reply composer starts open. */
  standalone?: boolean;
}) {
  const href = askEntryHref(thread.slug);
  const starter =
    thread.by === "owner" ? site.name : visitorName(thread.authorName);

  return (
    <article className="min-w-0">
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
        {thread.replies.map((reply) => (
          <li key={reply.key} className={threadItemClass}>
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
          </li>
        ))}
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
