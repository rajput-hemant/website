import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/survey/lib/utils";
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
  /** `lead` is an entry's opening message, set a size up. */
  size?: "lead" | "reply";
  /** The sender's own unmoderated message, shown only in their browser. */
  pending?: boolean;
  /** Links the timestamp, e.g. to the entry's permalink. */
  href?: string;
  /** Trailing controls on the name line, such as the owner's message menu. */
  actions?: React.ReactNode;
  className?: string;
};

export const visitorName = (authorName?: string) => authorName ?? "Anonymous";

/**
 * One message in the field notebook. A visitor's note sits on the sheet
 * inside a hairline; the surveyor's answer is set against a revision-purple
 * rule. Text is never markup (see `MessageBody`).
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
  const time = <time dateTime={createdAt}>{formatTimestamp(createdAt)}</time>;

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <div className="flex min-h-11 max-w-full flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className={cn("text-sm font-semibold", owner && "text-revision")}>
          {owner ? `${site.handle}, surveyor` : visitorName(authorName)}
        </span>
        {pending && (
          <span className="caps rounded-sm border border-dashed border-rule-strong px-1.5 py-0.5 text-ink-soft">
            Awaiting approval
          </span>
        )}
        <span aria-hidden className="text-ink-faint">
          &middot;
        </span>
        {href ? (
          <Link
            href={href}
            className="caps text-ink-faint tabular-nums underline decoration-transparent underline-offset-[0.3em] fine:hover:text-water fine:hover:decoration-current"
          >
            {time}
          </Link>
        ) : (
          <span className="caps text-ink-faint tabular-nums">{time}</span>
        )}
        {actions}
      </div>

      <div
        className={cn(
          "max-w-full bg-sheet px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border border-dashed border-rule-strong text-ink-soft"
            : owner
              ? "border-l-2 border-revision text-ink"
              : "border border-rule text-ink"
        )}
      >
        <MessageBody
          className={cn(
            size === "lead"
              ? "font-serif text-statement"
              : "text-base leading-relaxed"
          )}
        >
          {body}
        </MessageBody>
      </div>

      {pending && (
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock3 aria-hidden strokeWidth={1.75} className="size-3.5" />
          Only you can see this until it&rsquo;s approved.
        </p>
      )}
    </div>
  );
}
