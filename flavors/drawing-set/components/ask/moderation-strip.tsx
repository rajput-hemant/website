"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, IconButton, Tag } from "@/flavors/drawing-set/components/ui";
import { cn } from "@/flavors/drawing-set/lib/utils";
import { LoaderCircle, RotateCw } from "lucide-react";

import {
  getModeration,
  moderate,
  type ModerateRequest,
  type ModerationAction,
} from "@/lib/ask/client";
import { askEntryHref, excerpt } from "@/lib/ask/format";
import { type ModerationItem } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { useOwner } from "@/components/semantic/ask/owner-provider";

import { visitorName } from "./chat-bubble";
import { MessageBody } from "./message-body";

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

/** Owner-only queue of pending and recently flagged slips, above the tray. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  if (!owner) return null;
  return <ModerationQueue className={className} />;
}

function ModerationQueue({ className }: { className?: string }) {
  const headingId = React.useId();
  const [queue, setQueue] = React.useState<Queue>({ state: "loading" });

  React.useEffect(() => {
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
      data-print="hide"
      className={cn(
        "rounded-md border border-line-strong bg-sheet/60",
        className
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-line-strong py-2 pr-2 pl-4">
        <h2
          id={headingId}
          className="flex items-center gap-2.5 font-mono text-mono-xs tracking-[0.1em] text-ink uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Moderation
          {queue.state === "ready" && (
            <span className="text-ink-faint normal-case tabular-nums">
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
            Nothing waiting. Every slip has been reviewed.
          </p>
        )}
      </div>

      {queue.state === "ready" && queue.items.length > 0 && (
        <ol className="divide-y divide-line-strong">
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
  const [busy, setBusy] = React.useState<ModerationAction | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-mono-xs text-ink-faint">
        <span className="text-ink">
          {item.kind === "thread" ? "New RFI" : "Reply"}
        </span>
        <span aria-hidden>&middot;</span>
        <span className="text-ink-soft">{visitorName(message.authorName)}</span>
        <span aria-hidden>&middot;</span>
        <time dateTime={message.createdAt}>
          {formatTimestamp(message.createdAt)}
        </time>
        {flagged && (
          <Tag className="border-danger/40 text-danger">Flagged spam</Tag>
        )}
      </p>

      {item.kind === "reply" && (
        <p className="min-w-0 truncate text-xs text-ink-faint">
          In{" "}
          <Link
            href={askEntryHref(item.slug)}
            className="text-ink-soft underline underline-offset-2 hover:text-ink"
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
            className={cn(action === "spam" && "text-ink-soft")}
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
