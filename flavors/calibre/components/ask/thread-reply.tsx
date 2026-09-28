"use client";

import Link from "next/link";

import { useThreadReply } from "@/components/semantic/ask/use-thread-reply";

import { Composer } from "./composer";

const actionClass =
  "inline-flex min-h-11 items-center px-1 text-sm font-medium text-soft underline decoration-transparent decoration-2 underline-offset-[0.3em] transition-colors fine:hover:text-ink fine:hover:decoration-steel";

/** The last row of a thread: Reply opens an inline slip, plus the permalink. */
export function ThreadReply({
  handle,
  slug,
  replyTo,
  href,
  defaultOpen = false,
}: {
  handle: string;
  slug: string;
  replyTo: string;
  href?: string | undefined;
  defaultOpen?: boolean;
}) {
  const {
    announcement,
    close,
    collapsible,
    handleSent,
    open,
    openComposer,
    replyButtonRef,
  } = useThreadReply(
    defaultOpen,
    "Reply received. Only you can see it until it's approved."
  );
  return (
    <div className="min-w-0">
      {open ? (
        <Composer
          handle={handle}
          slug={slug}
          label={`Reply to ${replyTo}`}
          hideLabel
          placeholder="Write a reply…"
          autoFocus={collapsible}
          onSent={handleSent}
          onCancel={collapsible ? close : undefined}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-x-5">
          <button
            ref={replyButtonRef}
            type="button"
            aria-expanded={false}
            onClick={openComposer}
            className={actionClass}
          >
            Reply<span className="sr-only"> to {replyTo}</span>
          </button>
          {href ? (
            <Link href={href} className={actionClass}>
              Permalink
              <span className="sr-only"> to the question from {replyTo}</span>
            </Link>
          ) : null}
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
