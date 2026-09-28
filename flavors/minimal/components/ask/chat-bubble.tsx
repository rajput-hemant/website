import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/minimal/lib/utils";
import { Clock3 } from "lucide-react";

import { site } from "@/content/site";
import { type MessageAuthor } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";

import { MessageBody } from "./message-body";

export type ChatBubbleProps = {
  by: MessageAuthor;
  authorName?: string;
  body: string;
  createdAt: string;
  /** `lead` is a thread's opening message, set a size up. */
  size?: "lead" | "reply";
  /** The sender's own unmoderated message, shown only in their browser. */
  pending?: boolean;
  /** Links the timestamp, e.g. to the thread's permalink. */
  href?: string;
  /** Trailing controls on the name line, such as the owner's message menu. */
  actions?: React.ReactNode;
  className?: string;
};

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";

/**
 * One chat message: a name line, then the text in a bubble. The owner's
 * bubbles are accent-tinted and carry an "Owner" badge; visitor text is always
 * plain (see `MessageBody`).
 */
export function ChatBubble({
  by,
  authorName,
  body,
  createdAt,
  size = "reply",
  pending = false,
  href,
  actions,
  className,
}: ChatBubbleProps) {
  const owner = by === "owner";
  const date = formatTimestamp(createdAt);
  const time = <time dateTime={createdAt}>{date}</time>;

  return (
    <div className={cn("grid min-w-0 justify-items-start gap-2", className)}>
      <div className="flex min-h-6 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
        {owner ? (
          <>
            <span className="wordmark text-[0.9375rem] leading-none text-foreground">
              {site.name}
            </span>
            <span className="rounded-sm border border-accent/35 px-1.5 py-px meta text-accent">
              Owner
            </span>
          </>
        ) : (
          <span className="text-sm font-medium text-foreground">
            {visitorName(authorName)}
          </span>
        )}
        <span aria-hidden className="meta text-subtle">
          ·
        </span>
        {href ? (
          <Link
            href={href}
            className="link meta text-subtle transition-colors hover:text-foreground"
          >
            {time}
          </Link>
        ) : (
          <span className="meta text-subtle">{time}</span>
        )}
        {actions}
      </div>

      <div
        className={cn(
          "max-w-full rounded-lg rounded-tl-sm border px-4",
          size === "lead" ? "py-3.5 sm:px-5" : "py-2.5",
          pending
            ? "border-dashed border-foreground/20 bg-transparent text-muted"
            : owner
              ? "border-accent/20 bg-accent-soft/55 text-foreground"
              : "border-border/70 bg-surface text-foreground"
        )}
      >
        <MessageBody
          className={cn(
            size === "lead" ? "font-serif text-lg" : "text-base leading-relaxed"
          )}
        >
          {body}
        </MessageBody>
      </div>

      {pending && (
        <p className="flex items-center gap-1.5 text-xs text-subtle">
          <Clock3 aria-hidden strokeWidth={1.75} className="size-3.5" />
          Only you can see this until it&rsquo;s approved.
        </p>
      )}
    </div>
  );
}
