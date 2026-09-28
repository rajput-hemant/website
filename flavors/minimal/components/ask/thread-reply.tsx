"use client";

import Link from "next/link";
import { Link2, Reply } from "lucide-react";

import { useThreadReply } from "@/components/semantic/ask/use-thread-reply";

import { ChatComposer } from "./chat-composer";

const actionClass =
  "inline-flex h-6 items-center gap-1.5 meta text-muted transition-colors hover:text-foreground [&_svg]:size-3.5";

/**
 * The last row of a thread: a "Reply" control that expands an inline
 * composer, plus the permalink. On the permalink page the composer is open.
 */
export function ThreadReply({
  slug,
  replyTo,
  href,
  defaultOpen = false,
}: {
  slug: string;
  /** Who the reply answers, for the composer's accessible name. */
  replyTo: string;
  /** Permalink, when the thread is shown in the feed. */
  href?: string;
  defaultOpen?: boolean;
}) {
  const {
    open,
    collapsible,
    announcement,
    replyButtonRef,
    close,
    openComposer,
    handleSent,
  } = useThreadReply(
    defaultOpen,
    "Reply sent. Only you can see it until it's approved."
  );

  return (
    <div className="min-w-0">
      {open ? (
        <ChatComposer
          slug={slug}
          label={`Reply to ${replyTo}`}
          hideLabel
          placeholder="Write a reply…"
          autoFocus={collapsible}
          onSent={handleSent}
          onCancel={collapsible ? close : undefined}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <button
            ref={replyButtonRef}
            type="button"
            aria-expanded={false}
            onClick={openComposer}
            className={actionClass}
          >
            <Reply aria-hidden strokeWidth={1.75} />
            Reply
            <span className="sr-only"> to {replyTo}</span>
          </button>
          {href && (
            <Link href={href} className={actionClass}>
              <Link2 aria-hidden strokeWidth={1.75} />
              Permalink
              <span className="sr-only">
                {" "}
                to the conversation with {replyTo}
              </span>
            </Link>
          )}
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
