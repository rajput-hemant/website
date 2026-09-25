"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCw } from "lucide-react";

import { type ModerationItem } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

import {
  getModeration,
  moderate,
  type ModerateRequest,
  type ModerationAction,
} from "./api";
import { visitorName } from "./chat-bubble";
import { askEntryHref, excerpt } from "./format";
import { MessageBody } from "./message-body";
import { useOwner } from "./owner-provider";

type Queue =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; items: ModerationItem[] };

const itemTarget = (item: ModerationItem): ModerateRequest =>
  item.kind === "thread"
    ? { slug: item.slug, target: "thread", action: "publish" }
    : { slug: item.slug, target: item.reply.key, action: "publish" };

const itemId = (item: ModerationItem) =>
  item.kind === "thread" ? item.slug : `${item.slug}:${item.reply.key}`;

const toQueue = (result: Awaited<ReturnType<typeof getModeration>>): Queue =>
  result.ok
    ? { state: "ready", items: result.items }
    : { state: "error", message: result.message };

const actionLabels: Record<ModerationAction, string> = {
  publish: "Approve",
  reject: "Reject",
  spam: "Spam",
};

/** Owner-only queue of pending and recently flagged messages, above the feed. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  if (!owner) return null;
  return <ModerationQueue className={className} />;
}

function ModerationQueue({ className }: { className?: string }) {
  const headingId = useId();
  const [queue, setQueue] = useState<Queue>({ state: "loading" });

  useEffect(() => {
    let active = true;
    void getModeration().then((result) => {
      if (active) setQueue(toQueue(result));
    });
    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    setQueue({ state: "loading" });
    setQueue(toQueue(await getModeration()));
  }

  const pendingCount =
    queue.state === "ready"
      ? queue.items.filter((item) =>
          item.kind === "thread"
            ? item.status === "pending"
            : item.reply.status === "pending"
        ).length
      : 0;

  function resolve(item: ModerationItem) {
    if (queue.state !== "ready") return;
    setQueue({
      state: "ready",
      items: queue.items.filter((entry) => itemId(entry) !== itemId(item)),
    });
  }

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
            <li key={itemId(item)}>
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
  const router = useRouter();
  const [busy, setBusy] = useState<ModerationAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message =
    item.kind === "thread"
      ? {
          authorName: item.authorName,
          body: item.body,
          createdAt: item.submittedAt,
          status: item.status,
        }
      : { ...item.reply };
  const flagged = message.status === "spam";
  const actions: ModerationAction[] = flagged
    ? ["publish", "reject"]
    : ["publish", "reject", "spam"];

  async function run(action: ModerationAction) {
    setBusy(action);
    setError(null);
    const result = await moderate({ ...itemTarget(item), action });
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onResolved();
    router.refresh();
  }

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
            {actionLabels[action]}
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
