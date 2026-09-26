"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/flavors/minimal/components/ui/button";
import { IconButton } from "@/flavors/minimal/components/ui/icon-button";
import { cn } from "@/flavors/minimal/lib/utils";
import { LoaderCircle, RotateCw } from "lucide-react";

import { askEntryHref, excerpt, visitorName } from "@/lib/ask/format";
import { type ModerationItem } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { useOwner } from "@/components/semantic/ask/owner-provider";
import {
  moderationActionLabels,
  moderationItemId,
  useModerationItem,
  useModerationQueue,
} from "@/components/semantic/ask/use-moderation";

import { MessageBody } from "./message-body";

/** Owner-only queue of pending and recently flagged messages, above the feed. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  if (!owner) return null;
  return <ModerationQueue className={className} />;
}

function ModerationQueue({ className }: { className?: string }) {
  const headingId = React.useId();
  const { queue, pendingCount, reload, resolve } = useModerationQueue();

  return (
    <section
      aria-labelledby={headingId}
      data-print-hide
      className={cn("rounded-lg border border-border bg-surface/60", className)}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border py-2 pr-2 pl-4">
        <h2
          id={headingId}
          className="flex items-center gap-2.5 meta text-foreground"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Moderation
          {queue.state === "ready" && (
            <span className="text-subtle tabular-nums">
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
          <p className="flex items-center gap-2 px-4 py-5 text-sm text-subtle">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Loading the queue…
          </p>
        )}
        {queue.state === "error" && (
          <p className="px-4 py-5 text-sm text-danger">{queue.message}</p>
        )}
        {queue.state === "ready" && queue.items.length === 0 && (
          <p className="px-4 py-5 text-sm text-muted">
            Nothing waiting. Every message has been reviewed.
          </p>
        )}
      </div>

      {queue.state === "ready" && queue.items.length > 0 && (
        <ol className="divide-y divide-border">
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
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 meta text-subtle">
        <span className="text-foreground">
          {item.kind === "thread" ? "New conversation" : "Reply"}
        </span>
        <span aria-hidden>·</span>
        <span className="text-muted">{visitorName(message.authorName)}</span>
        <span aria-hidden>·</span>
        <time dateTime={message.createdAt}>
          {formatTimestamp(message.createdAt)}
        </time>
        {flagged && (
          <span className="rounded-sm border border-danger/40 px-1.5 py-px text-danger">
            Flagged spam
          </span>
        )}
      </p>

      {item.kind === "reply" && (
        <p className="min-w-0 truncate text-xs text-subtle">
          In{" "}
          <Link
            href={askEntryHref(item.slug)}
            className="link text-muted hover:text-foreground"
          >
            {excerpt(item.threadBody, 72)}
          </Link>
        </p>
      )}

      <MessageBody className="line-clamp-6 text-base leading-relaxed text-foreground">
        {message.body}
      </MessageBody>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={action === "publish" ? "accent" : "outline"}
            disabled={busy !== null}
            onClick={() => void run(action)}
            className={cn(action === "spam" && "text-muted")}
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
