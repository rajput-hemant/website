"use client";

import * as React from "react";
import Link from "next/link";
import { Led } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";
import { cn } from "@/flavors/surface/lib/utils";

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
      data-print="hide"
      className={cn("mod", className)}
    >
      <header className="seam-b flex items-center justify-between gap-4 py-3 pr-3 pl-4">
        <h2
          id={headingId}
          className="legend flex items-center gap-2.5 text-ink"
        >
          <Led on pulse={pendingCount > 0} />
          Moderation
        </h2>
        <div className="flex items-center gap-3">
          {queue.state === "ready" && (
            <p className="glass flex h-9 items-center gap-2.5 px-2.5">
              <span className="legend text-[0.59375rem]">Pending</span>
              <Seg value={pad2(pendingCount)} className="h-5" />
            </p>
          )}
          <button
            type="button"
            aria-label="Reload the moderation queue"
            disabled={queue.state === "loading"}
            onClick={() => void reload()}
            className="key key-sm"
          >
            Reload
          </button>
        </div>
      </header>

      <div aria-live="polite" aria-busy={queue.state === "loading"}>
        {queue.state === "loading" && (
          <p className="flex items-center gap-2 px-4 py-5 text-sm text-ink-2">
            <Led on pulse />
            Loading the queue&hellip;
          </p>
        )}
        {queue.state === "error" && (
          <p className="px-4 py-5 text-sm font-medium text-alarm">
            {queue.message}
          </p>
        )}
        {queue.state === "ready" && queue.items.length === 0 && (
          <p className="px-4 py-5 text-sm text-ink-2">
            Nothing waiting. Every message has been reviewed.
          </p>
        )}
      </div>

      {queue.state === "ready" && queue.items.length > 0 && (
        <ol className="divide-y divide-seam">
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
      <p className="legend flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-ink">
          {item.kind === "thread" ? "New question" : "Reply"}
        </span>
        <span aria-hidden>&middot;</span>
        <span className="normal-case">{visitorName(message.authorName)}</span>
        <span aria-hidden>&middot;</span>
        <time dateTime={message.createdAt}>
          {formatTimestamp(message.createdAt)}
        </time>
        {flagged && (
          <span className="rounded-[3px] border border-alarm/50 px-1.5 py-0.5 text-alarm">
            Flagged spam
          </span>
        )}
      </p>

      {item.kind === "reply" && (
        <p className="min-w-0 truncate text-xs text-ink-2">
          In{" "}
          <Link
            href={askEntryHref(item.slug)}
            className="text-ink underline decoration-ink-3 underline-offset-2 fine:hover:decoration-ink"
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
          <button
            key={action}
            type="button"
            disabled={busy !== null}
            onClick={() => void run(action)}
            className="key key-sm"
          >
            {action === "publish" && <Led on={busy === action} />}
            {busy === action ? "Working" : moderationActionLabels[action]}
          </button>
        ))}
        {error && (
          <p role="alert" className="text-sm font-medium text-alarm">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
