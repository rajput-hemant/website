import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/press/lib/utils";

import { site } from "@/content/site";
import type { MessageAuthor } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";

import { visitorName } from "./labels";
import { MessageBody } from "./message-body";

/**
 * One message on the corrections sheet. A visitor's query is set on the
 * sheet; the author's reply is stamped in blue ink in the margin style.
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
  authorName?: string;
  body: string;
  createdAt: string;
  size?: "lead" | "reply";
  pending?: boolean;
  href?: string;
  actions?: React.ReactNode;
}) {
  const owner = by === "owner";
  const time = <time dateTime={createdAt}>{formatTimestamp(createdAt)}</time>;
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-1">
        {owner ? (
          <span className="stamp-ink -rotate-2 border-[1.5px] border-blue px-1.5 pt-1 pb-0.5 font-mono text-[0.625rem] leading-none font-semibold tracking-[0.1em] text-blue uppercase [font-stretch:75%]">
            Author
          </span>
        ) : null}
        <span className="text-sm font-bold">
          {owner ? site.handle : visitorName(authorName)}
        </span>
        {pending ? (
          <mark className="slug text-ink!">Awaiting approval</mark>
        ) : null}
        <span aria-hidden className="text-ink-soft">
          /
        </span>
        {href ? (
          <Link
            href={href}
            className="slug underline decoration-transparent underline-offset-[0.3em] fine:hover:decoration-current"
          >
            {time}
          </Link>
        ) : (
          <span className="slug">{time}</span>
        )}
        {actions}
      </div>
      <div
        className={cn(
          "max-w-full px-4",
          size === "lead" ? "py-4 sm:px-5" : "py-3",
          pending
            ? "border border-dashed border-ink-soft text-ink-soft"
            : owner
              ? "border-l-[3px] border-blue bg-sheet text-blue"
              : "bg-sheet shadow-[inset_0_0_0_1px_var(--color-rule)]"
        )}
      >
        <MessageBody
          className={
            size === "lead"
              ? "text-lead leading-snug font-semibold"
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
