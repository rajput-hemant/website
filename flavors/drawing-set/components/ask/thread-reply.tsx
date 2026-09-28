"use client";

import * as React from "react";
import Link from "next/link";
import { Link2, Reply } from "lucide-react";

import { type PostStatus } from "@/lib/ask/client";

import { ChatComposer } from "./chat-composer";

const actionClass =
  "inline-flex min-h-11 items-center gap-1.5 px-1 font-mono text-mono-xs text-ink-soft transition-colors hover:text-ink [&_svg]:size-3.5";

/**
 * The last row of a thread: a "Reply" control that expands an inline slip
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
  /** Permalink, when the thread is shown in the tray. */
  href?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [announcement, setAnnouncement] = React.useState("");
  const replyButtonRef = React.useRef<HTMLButtonElement>(null);
  const collapsible = !defaultOpen;

  function close() {
    setOpen(false);
    requestAnimationFrame(() => replyButtonRef.current?.focus());
  }

  function handleSent(status: PostStatus) {
    if (!collapsible) return;
    setAnnouncement(
      status === "published"
        ? "Reply published."
        : "Reply filed. Only you can see it until it's approved."
    );
    close();
  }

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
            onClick={() => {
              setAnnouncement("");
              setOpen(true);
            }}
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
