import { SceneGlyph } from "@/flavors/drawing-set/components/site/scene-glyph";
import { Disclosure, Stamp } from "@/flavors/drawing-set/components/ui";

import { askEntryHref } from "@/lib/ask/format";
import { getSiteIdentity } from "@/lib/data";
import type { Question } from "@/lib/data/types";

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
 * One conversation: the opening slip, its published replies joined by the
 * thread line, the sender's own pending replies, and the reply row. In the
 * feed the published replies fold behind an "N replies" toggle; the permalink
 * page shows them all.
 */
export async function ChatThread({
  thread,
  rfiLabel,
  standalone = false,
  stamp,
}: {
  thread: Question;
  /** `RFI-014`; omitted for the sender's own not-yet-published echo. */
  rfiLabel?: string;
  /** On the permalink page: no self-links, and the reply composer starts open. */
  standalone?: boolean;
  /** A 3D answered stamp beside the label (K2), in this glyph view slot. */
  stamp?: "a" | "b" | undefined;
}) {
  const site = await getSiteIdentity();
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
    <article data-glyph-host className="relative min-w-0">
      {standalone ? (
        // A paper clip binds the question to its response (R2).
        <SceneGlyph
          kind="clip"
          slot="a"
          className="absolute -top-4 left-3 z-10 size-9"
        />
      ) : null}
      {rfiLabel && (
        <p className="mb-3 flex items-center gap-2 font-mono text-mono-xs tracking-[0.1em] text-ink-faint uppercase">
          <span>{rfiLabel}</span>
          <span aria-hidden>&middot;</span>
          <span>Question</span>
          {answered && (
            <>
              <span aria-hidden>&middot;</span>
              <span>Response</span>
              {stamp ? (
                <SceneGlyph
                  kind="stamp"
                  slot={stamp}
                  data={{ "data-press": "enter" }}
                  className="-my-3 size-8"
                />
              ) : null}
            </>
          )}
          {!answered && (
            <Stamp tone="ink" meaning="No response yet" className="ml-1">
              Unanswered
            </Stamp>
          )}
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
            <li
              key={reply.key}
              // The permalink's scene shingles one slip per reply under the RFI.
              data-scene-item={standalone ? `reply:${reply.key}` : undefined}
              className={threadItemClass}
            >
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
              summaryClassName="ml-5 h-6 w-fit items-center gap-1.5 rounded-sm font-mono text-mono-xs text-ink-soft transition-colors hover:text-ink sm:ml-7"
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
