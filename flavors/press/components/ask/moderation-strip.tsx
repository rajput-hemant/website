"use client";

import * as React from "react";
import Link from "next/link";
import { Button, IconButton } from "@/flavors/press/components/ui/button";
import { cn, route } from "@/flavors/press/lib/utils";
import { LoaderCircle, RotateCw } from "lucide-react";

import { askEntryHref, excerpt } from "@/lib/ask/format";
import type { ModerationItem } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { useOwner } from "@/components/semantic/ask/owner-provider";
import {
  moderationActionLabels,
  moderationItemId,
  useModerationItem,
  useModerationQueue,
} from "@/components/semantic/ask/use-moderation";

import { visitorName } from "./labels";
import { MessageBody } from "./message-body";

/** The author's queue of pending and flagged messages, above the sheet. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  return owner ? <Queue className={className} /> : null;
}

function Queue({ className }: { className?: string }) {
  const headingId = React.useId();
  const { queue, reload, pendingCount, resolve } = useModerationQueue();
  return (
    <section
      aria-labelledby={headingId}
      data-print="hide"
      className={cn("border border-ink bg-sheet", className)}
    >
      <header className="flex items-center justify-between gap-4 border-b border-ink py-1 pr-1 pl-4">
        <h2 id={headingId} className="flex items-center gap-2.5 slug text-ink!">
          <i aria-hidden className="size-2 bg-yellow" />
          Moderation
          {queue.state === "ready" ? (
            <span className="text-ink-soft">{pendingCount} pending</span>
          ) : null}
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
        {queue.state === "loading" ? (
          <p className="flex items-center gap-2 px-4 py-5 text-sm text-ink-soft">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Loading the queue…
          </p>
        ) : null}
        {queue.state === "error" ? (
          <p className="px-4 py-5 text-sm text-danger">{queue.message}</p>
        ) : null}
        {queue.state === "ready" && queue.items.length === 0 ? (
          <p className="px-4 py-5 text-sm text-ink-soft">
            Nothing waiting. Every message has been reviewed.
          </p>
        ) : null}
      </div>
      {queue.state === "ready" && queue.items.length > 0 ? (
        <ol className="divide-y divide-rule">
          {queue.items.map((item) => (
            <li key={moderationItemId(item)}>
              <Row item={item} onResolved={() => resolve(item)} />
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function Row({
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
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 slug">
        <span className="text-ink">
          {item.kind === "thread" ? "New query" : "Reply"}
        </span>
        <span aria-hidden>/</span>
        <span>{visitorName(message.authorName)}</span>
        <span aria-hidden>/</span>
        <time dateTime={message.createdAt}>
          {formatTimestamp(message.createdAt)}
        </time>
        {flagged ? <span className="text-danger">Flagged spam</span> : null}
      </p>
      {item.kind === "reply" ? (
        <p className="min-w-0 truncate text-sm text-ink-soft">
          In{" "}
          <Link
            href={route(askEntryHref(item.slug))}
            className="underline underline-offset-2 fine:hover:text-ink"
          >
            {excerpt(item.threadBody, 72)}
          </Link>
        </p>
      ) : null}
      <MessageBody className="line-clamp-6 leading-relaxed">
        {message.body}
      </MessageBody>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={action === "publish" ? "ink" : "outline"}
            disabled={busy !== null}
            onClick={() => void run(action)}
          >
            {busy === action ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : null}
            {moderationActionLabels[action]}
          </Button>
        ))}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
