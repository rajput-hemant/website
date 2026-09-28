import * as React from "react";
import Link from "next/link";
import { Led } from "@/flavors/surface/components/ui/primitives";
import { cn } from "@/flavors/surface/lib/utils";

import { site } from "@/content/site";
import { visitorName } from "@/lib/ask/format";
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

export { visitorName };

/**
 * One message: a legend line (who, status lamp, when), then the text on a
 * panel. Owner replies sit on the LCD glass with a lit "Answered" lamp;
 * visitor messages sit on the raised plate (see `MessageBody` for why text is
 * never markup). A pending message breathes until it's approved.
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
    <div className={cn("grid min-w-0 justify-items-start gap-2", className)}>
      <div className="flex min-h-11 max-w-full flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "text-[0.9375rem] font-medium text-ink",
            owner && "font-display tracking-[0.02em]"
          )}
        >
          {owner ? site.handle : visitorName(authorName)}
        </span>
        {owner && (
          <span className="legend inline-flex items-center gap-1.5">
            <Led on />
            Answered
          </span>
        )}
        {pending && (
          <span className="legend inline-flex items-center gap-1.5">
            <Led on pulse />
            Pending
          </span>
        )}
        <span aria-hidden className="text-ink-3">
          &middot;
        </span>
        {href ? (
          <Link
            href={href}
            className="legend tracking-[0.06em] normal-case transition-colors duration-150 fine:hover:text-ink"
          >
            {time}
          </Link>
        ) : (
          <span className="legend tracking-[0.06em] normal-case">{time}</span>
        )}
        {actions}
      </div>

      <div
        className={cn(
          "max-w-full rounded-[8px] px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border border-dashed border-ink-3 text-ink-2"
            : owner
              ? "glass"
              : "mod text-ink"
        )}
      >
        <MessageBody
          className={
            size === "lead"
              ? "font-display text-[1.25rem] leading-snug tracking-[0.005em]"
              : "text-base leading-relaxed"
          }
        >
          {body}
        </MessageBody>
      </div>

      {pending && (
        <p className="text-sm text-ink-2">
          Only you can see this until it&rsquo;s approved.
        </p>
      )}
    </div>
  );
}
