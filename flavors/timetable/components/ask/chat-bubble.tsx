import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/timetable/lib/utils";
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
 * One message on the information desk. A visitor's question sits on a plain
 * enamel card; an answer from the desk is posted on the dark sign, with the
 * information pictogram. Text is never markup (see `MessageBody`).
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
        {owner ? (
          <span
            aria-hidden
            className="grid size-5.5 place-items-center rounded-[3px] bg-ink pt-0.5 text-xs font-extrabold text-ground"
          >
            i
          </span>
        ) : null}
        <span className="text-[0.9375rem] font-bold">
          {owner ? `${site.handle}, at the desk` : visitorName(authorName)}
        </span>
        {pending && (
          <span className="rounded-[3px] bg-signal px-1.5 pt-1 pb-0.5 font-mono text-mono-xs leading-none font-bold text-signal-ink uppercase">
            Awaiting approval
          </span>
        )}
        <span aria-hidden className="text-ink-faint">
          /
        </span>
        {href ? (
          <Link
            href={href}
            className="font-mono text-mono-sm text-ink-soft underline decoration-transparent underline-offset-[0.25em] fine:hover:decoration-current"
          >
            {time}
          </Link>
        ) : (
          <span className="font-mono text-mono-sm text-ink-soft">{time}</span>
        )}
        {actions}
      </div>

      <div
        data-dark-surface={owner && !pending ? "" : undefined}
        className={cn(
          "max-w-full rounded-md px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border border-dashed border-rule-strong text-ink-soft"
            : owner
              ? "bg-sign text-on-sign"
              : "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-rule)]"
        )}
      >
        <MessageBody
          className={cn(
            size === "lead"
              ? "text-lead leading-snug font-semibold"
              : "text-base leading-relaxed"
          )}
        >
          {body}
        </MessageBody>
      </div>

      {pending && (
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock3 aria-hidden strokeWidth={2} className="size-3.5" />
          Only you can see this until it&rsquo;s approved.
        </p>
      )}
    </div>
  );
}
