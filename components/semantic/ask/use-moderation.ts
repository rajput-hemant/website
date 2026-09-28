"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  getModeration,
  moderate,
  type ModerateRequest,
  type ModerationAction,
} from "@/lib/ask/client";
import { type ModerationItem } from "@/lib/data/types";

export type ModerationQueue =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; items: ModerationItem[] };

export const moderationActionLabels: Record<ModerationAction, string> = {
  publish: "Approve",
  reject: "Reject",
  spam: "Spam",
};

const itemTarget = (item: ModerationItem): ModerateRequest =>
  item.kind === "thread"
    ? { slug: item.slug, target: "thread", action: "publish" }
    : { slug: item.slug, target: item.reply.key, action: "publish" };

/** A stable key for a queue item: the thread slug, or slug and reply key. */
export const moderationItemId = (item: ModerationItem) =>
  item.kind === "thread" ? item.slug : `${item.slug}:${item.reply.key}`;

const toQueue = (
  result: Awaited<ReturnType<typeof getModeration>>
): ModerationQueue =>
  result.ok
    ? { state: "ready", items: result.items }
    : { state: "error", message: result.message };

/** The owner's moderation queue: loads on mount, reloads on demand, and drops items once resolved. */
export function useModerationQueue() {
  const [queue, setQueue] = React.useState<ModerationQueue>({
    state: "loading",
  });

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
      items: queue.items.filter(
        (entry) => moderationItemId(entry) !== moderationItemId(item)
      ),
    });
  }

  return { queue, pendingCount, reload, resolve };
}

/**
 * One queue item: its message, which actions apply (a flagged item can't be
 * flagged again), and running an action with its busy and error state.
 */
export function useModerationItem(
  item: ModerationItem,
  onResolved: () => void
) {
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

  return { message, flagged, actions, busy, error, run };
}
