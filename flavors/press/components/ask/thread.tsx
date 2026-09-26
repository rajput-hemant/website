import { Disclosure } from "@/flavors/press/components/ui/disclosure";

import { site } from "@/content/site";
import { askEntryHref } from "@/lib/ask/format";
import type { Question } from "@/lib/data/types";

import { visitorName } from "./labels";
import { Message } from "./message";
import { MessageMenu } from "./message-menu";
import { PendingReplies } from "./pending";
import { ThreadReply } from "./thread-reply";

/** A proofreader's leader line from the query to each reply in the margin. */
const itemClass =
  "relative min-w-0 pt-5 before:absolute before:top-0 before:bottom-0 before:-left-5 before:w-px before:bg-ink-soft last:before:bottom-auto last:before:h-10 after:absolute after:top-10 after:-left-5 after:h-px after:w-3.5 after:bg-ink-soft sm:before:-left-7 sm:after:-left-7 sm:after:w-5";

const repliesLabel = (count: number) =>
  count === 1 ? "1 reply" : `${count} replies`;

/**
 * One query: the opening message, its published replies joined by leader
 * lines, the sender's pending replies, and the reply row. In the feed the
 * replies fold away; the permalink page shows them all.
 */
export function Thread({
  thread,
  label,
  standalone = false,
}: {
  thread: Question;
  label?: string;
  standalone?: boolean;
}) {
  const href = askEntryHref(thread.slug);
  const starter =
    thread.by === "owner" ? site.handle : visitorName(thread.authorName);
  const answered = thread.replies.some((reply) => reply.by === "owner");
  const replies = thread.replies.map((reply) => (
    <li key={reply.key} className={itemClass}>
      <Message
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
  ));

  return (
    <article className="min-w-0">
      {label ? (
        <p className="mb-3 flex flex-wrap items-center gap-2.5 slug">
          <span className="text-ink">{label}</span>
          {answered ? (
            <span>Answered</span>
          ) : (
            <mark className="text-ink">Awaiting an answer</mark>
          )}
        </p>
      ) : null}
      <Message
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
              label={`query from ${starter}`}
            />
          )
        }
      />
      <ol aria-label="Replies" className="grid pl-8 sm:pl-11">
        {standalone || replies.length === 0 ? (
          replies
        ) : (
          <li className={itemClass}>
            <Disclosure
              summary={repliesLabel(replies.length)}
              summaryClassName="text-sm text-ink-soft fine:hover:text-ink"
            >
              <ol className="grid">{replies}</ol>
            </Disclosure>
          </li>
        )}
        <PendingReplies
          slug={thread.slug}
          publishedKeys={thread.replies.map((reply) => reply.key)}
          itemClass={itemClass}
        />
        <li className={itemClass}>
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
