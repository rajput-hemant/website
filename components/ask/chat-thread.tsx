import { site } from "@/content/site";
import { type Question } from "@/lib/data/types";
import { SharedElement } from "@/components/interaction/shared-element";
import { sharedElementName } from "@/components/interaction/shared-element-name";
import { Disclosure } from "@/components/ui/disclosure";

import { ChatBubble, visitorName } from "./chat-bubble";
import { askEntryHref } from "./format";
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
 * thread line, the sender's own pending replies, and the reply row. In the
 * feed the published replies fold behind an "N replies" toggle; the permalink
 * page shows them all.
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
      <SharedElement name={sharedElementName("ask", thread.slug)}>
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
      </SharedElement>

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
              // Starts on the thread line so the replies' elbows sit inside
              // the box that clips the open/close animation.
              className="-ml-5 min-w-0 sm:-ml-7"
              summaryClassName="ml-5 h-6 w-fit items-center gap-1.5 rounded-sm meta text-muted transition-colors hover:text-foreground sm:ml-7"
              contentClassName="pl-5 sm:pl-7"
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
