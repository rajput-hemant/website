"use client";

import Link from "next/link";
import { Link2, Reply } from "lucide-react";

import { useThreadReply } from "@/components/semantic/ask/use-thread-reply";

import { ChatComposer } from "./chat-composer";

const actionClass =
  "caps inline-flex min-h-11 items-center gap-1.5 px-1 text-ink-soft transition-colors fine:hover:text-water [&_svg]:size-3.5";

/** The last row of an entry: "Reply" opens an inline composer, plus its permalink. */
export function ThreadReply({
  slug,
  replyTo,
  href,
  defaultOpen = false,
}: {
  slug: string;
  /** Who the reply answers, for the composer's accessible name. */
  replyTo: string;
  /** Permalink, when the entry is shown in the feed. */
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
    "Reply received. Only you can see it until it's approved."
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
              <span className="sr-only"> to the entry from {replyTo}</span>
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
