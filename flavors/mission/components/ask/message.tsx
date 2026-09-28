import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/mission/lib/utils";

import { site } from "@/content/site";
import type { MessageAuthor } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";

import { visitorName } from "./labels";
import { MessageBody } from "./message-body";

/**
 * One transmission on the capcom loop. A visitor's question is a slip clipped
 * to the board; the author's answer is set in ink beside it.
 */
export function Message({
  by,
  authorName,
  body,
  createdAt,
  size = "reply",
  pending = false,
  href,
  actions,
}: {
  by: MessageAuthor;
  authorName?: string | undefined;
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
          <span className="rounded-none border-[1.5px] border-ink px-1.5 pt-1 pb-0.5 font-mono text-[0.625rem] leading-none font-semibold tracking-[0.1em] text-ink uppercase">
            Author
          </span>
        ) : null}
        <span className="text-sm font-medium">
          {owner ? site.handle : visitorName(authorName)}
        </span>
        {pending ? (
          <mark className="label text-ink!">Awaiting approval</mark>
        ) : null}
        <span aria-hidden className="text-ink-soft">
          /
        </span>
        {href ? (
          <Link
            href={href}
            className="label underline decoration-transparent underline-offset-[0.3em] fine:hover:decoration-current"
          >
            {time}
          </Link>
        ) : (
          <span className="label">{time}</span>
        )}
        {actions}
      </div>
      <div
        className={cn(
          "max-w-full",
          size === "lead" ? "py-1" : "py-2.5 pl-4",
          pending
            ? "rounded-none border border-dashed border-ink-soft px-4 py-3 text-ink-soft"
            : owner
              ? "border-l-[3px] border-ink text-ink"
              : size === "lead"
                ? ""
                : "border-l border-rule-strong"
        )}
      >
        <MessageBody
          className={
            size === "lead"
              ? "font-display text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] leading-tight"
              : "leading-relaxed"
          }
        >
          {body}
        </MessageBody>
      </div>
      {pending ? (
        <p className="text-sm text-ink-soft">
          Only you can see this until it&rsquo;s approved.
        </p>
      ) : null}
    </div>
  );
}
