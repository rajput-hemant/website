import * as React from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";

import { site } from "@/content/site";
import { type MessageAuthor } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

import { MessageBody } from "./message-body";

export type ChatBubbleProps = {
  by: MessageAuthor;
  authorName?: string;
  body: string;
  createdAt: string;
  /** `lead` is a thread's opening slip, set a size up. */
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
 * One message, filed as a slip: a name line, then the text on an index card.
 * Owner slips carry an accent top rule and an "Answered" stamp; visitor slips
 * stay a plain paper tone (see `MessageBody` for why text is never markup).
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
      <div className="flex min-h-11 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "text-sm font-medium",
            owner ? "font-display text-paper" : "text-paper"
          )}
        >
          {owner ? site.name : visitorName(authorName)}
        </span>
        {owner && (
          <span
            aria-hidden
            className="-rotate-2 rounded-sm border border-accent/40 px-1.5 py-px font-mono text-mono-xs tracking-[0.14em] text-accent uppercase"
          >
            Answered
          </span>
        )}
        <span aria-hidden className="text-pencil">
          &middot;
        </span>
        {href ? (
          <Link
            href={href}
            className="font-mono text-mono-xs text-pencil transition-colors hover:text-paper"
          >
            {time}
          </Link>
        ) : (
          <span className="font-mono text-mono-xs text-pencil">{time}</span>
        )}
        {actions}
      </div>

      <div
        className={cn(
          "max-w-full rounded-md rounded-tl-sm border px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border-dashed border-pencil/40 bg-transparent text-graphite"
            : owner
              ? "border-t-2 border-rule border-t-accent bg-ink-raised text-paper"
              : "border-rule bg-ink-raised text-paper"
        )}
      >
        <MessageBody
          className={cn(
            size === "lead"
              ? "font-display text-lg font-normal"
              : "text-base leading-relaxed"
          )}
        >
          {body}
        </MessageBody>
      </div>

      {pending && (
        <p className="flex items-center gap-1.5 text-sm text-graphite">
          <Clock3 aria-hidden strokeWidth={1.75} className="size-3.5" />
          Only you can see this until it&rsquo;s approved.
        </p>
      )}
    </div>
  );
}
