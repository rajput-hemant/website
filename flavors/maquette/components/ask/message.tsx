import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/maquette/lib/utils";

import type { MessageAuthor } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";

import { MessageBody } from "./message-body";

/**
 * One message on a comment card. A visitor's question is set on the card;
 * the author's reply sits under it, on a basswood rule.
 */
export function Message({
  by,
  name,
  body,
  createdAt,
  size = "reply",
  pending = false,
  href,
  actions,
}: {
  by: MessageAuthor;
  /** Who wrote it, as shown: the author's handle or the visitor's name. */
  name: string;
  body: string;
  createdAt: string;
  size?: "lead" | "reply";
  pending?: boolean;
  href?: string | undefined;
  actions?: React.ReactNode;
}) {
  const owner = by === "owner";
  const time = <time dateTime={createdAt}>{formatTimestamp(createdAt)}</time>;
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-1">
        {owner ? (
          <span aria-hidden className="num text-cut">
            Reply
          </span>
        ) : null}
        <span className="text-sm font-semibold">{name}</span>
        {pending ? (
          <mark className="num text-ink">Awaiting approval</mark>
        ) : null}
        <span aria-hidden className="text-soft">
          /
        </span>
        {href ? (
          <Link
            href={href}
            className="num underline decoration-transparent underline-offset-[0.3em] fine:hover:decoration-current"
          >
            {time}
          </Link>
        ) : (
          <span className="num">{time}</span>
        )}
        {actions}
      </div>
      <div
        className={cn(
          "max-w-full px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border border-dashed border-line-strong text-soft"
            : owner
              ? "border-l-2 border-wood bg-ground/50"
              : "rounded-[2px] bg-ground/40 shadow-[inset_0_0_0_1px_var(--color-line)]"
        )}
      >
        <MessageBody
          className={
            size === "lead"
              ? "font-display text-lead leading-snug"
              : "leading-relaxed"
          }
        >
          {body}
        </MessageBody>
      </div>
      {pending ? (
        <p className="text-sm text-soft">
          Only you can see this until it&rsquo;s approved.
        </p>
      ) : null}
    </div>
  );
}
