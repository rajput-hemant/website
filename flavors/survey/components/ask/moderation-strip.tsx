"use client";

import * as React from "react";
import Link from "next/link";
import { Button, IconButton } from "@/flavors/survey/components/ui/button";
import { Tag } from "@/flavors/survey/components/ui/tag";
import { cn } from "@/flavors/survey/lib/utils";
import { LoaderCircle, RotateCw } from "lucide-react";

import { askEntryHref, excerpt } from "@/lib/ask/format";
import { type ModerationItem } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { useOwner } from "@/components/semantic/ask/owner-provider";
import {
  moderationActionLabels,
  moderationItemId,
  useModerationItem,
  useModerationQueue,
} from "@/components/semantic/ask/use-moderation";

import { visitorName } from "./chat-bubble";
import { MessageBody } from "./message-body";

/** Owner-only queue of pending and recently flagged notes, above the entries. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  if (!owner) return null;
  return <ModerationQueue className={className} />;
}

function ModerationQueue({ className }: { className?: string }) {
  const headingId = React.useId();
  const { queue, reload, pendingCount, resolve } = useModerationQueue();

  return (
    <section
      aria-labelledby={headingId}
      data-print="hide"
      className={cn("border border-rule-strong bg-sheet", className)}
    >
      <header className="flex items-center justify-between gap-4 border-b border-rule py-1 pr-1 pl-4">
        <h2
          id={headingId}
          className="caps flex items-center gap-2.5 text-revision"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-revision" />
          Revision queue
          {queue.state === "ready" && (
            <span className="text-ink-faint tabular-nums">
              {pendingCount} pending
            </span>
          )}
        </h2>
        <IconButton
          label="Reload the moderation queue"
          disabled={queue.state === "loading"}
          onClick={() => void reload()}
        >
          <RotateCw aria-hidden strokeWidth={1.75} />
        </IconButton>
      </header>

      <div aria-live="polite" aria-busy={queue.state === "loading"}>
        {queue.state === "loading" && (
          <p className="flex items-center gap-2 px-4 py-5 text-sm text-ink-faint">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Loading the queue&hellip;
          </p>
        )}
        {queue.state === "error" && (
          <p className="px-4 py-5 text-sm text-danger">{queue.message}</p>
        )}
        {queue.state === "ready" && queue.items.length === 0 && (
          <p className="px-4 py-5 text-sm text-ink-soft">
            Nothing waiting. Every note has been checked.
          </p>
        )}
      </div>

      {queue.state === "ready" && queue.items.length > 0 && (
        <ol className="divide-y divide-rule">
          {queue.items.map((item) => (
            <li key={moderationItemId(item)}>
              <ModerationRow item={item} onResolved={() => resolve(item)} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ModerationRow({
  item,
  onResolved,
}: {
  item: ModerationItem;
  onResolved: () => void;
}) {
  const { message, flagged, actions, busy, error, run } = useModerationItem(
    item,
    onResolved
  );

  return (
    <article className="grid gap-3 px-4 py-4">
      <p className="caps flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-faint">
        <span className="text-ink">
          {item.kind === "thread" ? "New entry" : "Reply"}
        </span>
        <span aria-hidden>&middot;</span>
        <span className="text-ink-soft normal-case">
          {visitorName(message.authorName)}
        </span>
        <span aria-hidden>&middot;</span>
        <time dateTime={message.createdAt}>
          {formatTimestamp(message.createdAt)}
        </time>
        {flagged && (
          <Tag className="border-danger/40 text-danger">Flagged spam</Tag>
        )}
      </p>

      {item.kind === "reply" && (
        <p className="min-w-0 truncate text-sm text-ink-faint">
          In{" "}
          <Link
            href={askEntryHref(item.slug)}
            className="text-ink-soft underline decoration-contour underline-offset-2 fine:hover:text-water"
          >
            {excerpt(item.threadBody, 72)}
          </Link>
        </p>
      )}

      <MessageBody className="line-clamp-6 text-base leading-relaxed text-ink">
        {message.body}
      </MessageBody>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={action === "publish" ? "primary" : "quiet"}
            disabled={busy !== null}
            onClick={() => void run(action)}
            className={cn(action === "spam" && "text-ink-faint")}
          >
            {busy === action && (
              <LoaderCircle aria-hidden className="animate-spin" />
            )}
            {moderationActionLabels[action]}
          </Button>
        ))}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
