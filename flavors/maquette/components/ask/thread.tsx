import { Disclosure } from "@/flavors/maquette/components/ui/disclosure";
import { cn } from "@/flavors/maquette/lib/utils";

import { site } from "@/content/site";
import { askEntryHref } from "@/lib/ask/format";
import type { Question } from "@/lib/data/types";

import { isAnswered } from "./card";
import { visitorName } from "./labels";
import { Message } from "./message";
import { MessageMenu } from "./message-menu";
import { PendingReplies } from "./pending";
import { ThreadReply } from "./thread-reply";

/** A pencil line from the question down to each reply. */
const itemClass =
  "relative min-w-0 pt-5 before:absolute before:top-0 before:bottom-0 before:-left-5 before:w-px before:bg-line-strong last:before:bottom-auto last:before:h-10 after:absolute after:top-10 after:-left-5 after:h-px after:w-3.5 after:bg-line-strong sm:before:-left-7 sm:after:-left-7 sm:after:w-5";

const repliesLabel = (count: number) =>
  count === 1 ? "1 reply" : `${count} replies`;

/**
 * One card: the opening message, its published replies joined by leader
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
  const answered = isAnswered(thread);
  const replies = thread.replies.map((reply) => (
    <li key={reply.key} className={itemClass}>
      <Message
        by={reply.by}
        name={
          reply.by === "owner" ? site.handle : visitorName(reply.authorName)
        }
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
    <article
      className={cn(
        "min-w-0",
        label &&
          "grid gap-x-8 gap-y-4 lg:grid-cols-[9.5rem_minmax(0,1fr)] lg:items-start"
      )}
    >
      {label ? (
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-b border-line pb-3 lg:grid lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
          <p className="font-display text-[1.375rem] leading-none font-light tracking-[-0.01em] text-ink">
            {label}
          </p>
          <p className="flex items-center gap-2 caps">
            <i
              aria-hidden
              className={cn(
                "h-2.5 w-3.5 border",
                answered
                  ? "border-piece-edge bg-piece"
                  : "border-transparent shadow-[inset_0_0_0_1.5px_var(--color-wood)]"
              )}
            />
            {answered ? (
              <span className="text-ink">Answered</span>
            ) : (
              <mark className="text-ink">Awaiting an answer</mark>
            )}
          </p>
          <p className="num">
            {answered ? "White card" : "Basswood frame, open"}
          </p>
        </header>
      ) : null}
      <div className="min-w-0">
        <Message
          by={thread.by}
          size="lead"
          name={starter}
          body={thread.body}
          createdAt={thread.submittedAt}
          href={standalone ? undefined : href}
          actions={
            thread.by === "visitor" && (
              <MessageMenu
                slug={thread.slug}
                target="thread"
                label={`question from ${starter}`}
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
                summaryClassName="text-sm text-soft fine:hover:text-ink"
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
              handle={site.handle}
              slug={thread.slug}
              replyTo={starter}
              href={standalone ? undefined : href}
              defaultOpen={standalone}
            />
          </li>
        </ol>
      </div>
    </article>
  );
}
