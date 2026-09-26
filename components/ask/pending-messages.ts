"use client";

import * as React from "react";

/**
 * The sender's own messages that are waiting for moderation, kept in this
 * browser only so they can be shown in place until they are published.
 */
export type PendingMessage = {
  /** The thread's slug; for a new thread, the thread itself. */
  slug: string;
  /** The reply's key; absent for a new thread. */
  key?: string;
  body: string;
  authorName?: string;
  createdAt: string;
};

export const PENDING_KEY = "hr.ask.pending";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const CHANGE_EVENT = "hr:ask-pending";

const none: PendingMessage[] = [];

function isPendingMessage(value: unknown): value is PendingMessage {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.slug === "string" &&
    typeof entry.body === "string" &&
    typeof entry.createdAt === "string" &&
    (entry.key === undefined || typeof entry.key === "string") &&
    (entry.authorName === undefined || typeof entry.authorName === "string")
  );
}

const isFresh = (entry: PendingMessage, now: number) =>
  now - new Date(entry.createdAt).getTime() < MAX_AGE_MS;

function readRaw(): string | null {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): PendingMessage[] {
  if (!raw) return none;
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isPendingMessage) : none;
  } catch {
    return none;
  }
}

function write(entries: PendingMessage[]) {
  try {
    if (entries.length === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked: the echo is a convenience, the message is sent.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addPendingMessage(entry: PendingMessage) {
  const now = Date.now();
  write([...parse(readRaw()).filter((item) => isFresh(item, now)), entry]);
}

/** Drops entries that are published (per `isPublished`) or older than 14 days. */
function prunePendingMessages(isPublished: (entry: PendingMessage) => boolean) {
  const now = Date.now();
  const entries = parse(readRaw());
  const kept = entries.filter(
    (entry) => isFresh(entry, now) && !isPublished(entry)
  );
  if (kept.length !== entries.length) write(kept);
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PENDING_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

let cached: { raw: string | null; entries: PendingMessage[] } = {
  raw: null,
  entries: none,
};

/** Parsed once per stored value, so the snapshot keeps its identity between renders. */
function getSnapshot(): PendingMessage[] {
  const raw = readRaw();
  if (raw !== cached.raw) cached = { raw, entries: parse(raw) };
  return cached.entries;
}

const getServerSnapshot = () => none;

function usePendingEntries(): PendingMessage[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * This browser's pending new threads, newest first. Threads whose slug is in
 * `publishedSlugs` (the page's published data) are removed from storage.
 */
export function usePendingThreads(
  publishedSlugs: readonly string[]
): PendingMessage[] {
  const entries = usePendingEntries();
  const published = publishedSlugs.join(" ");

  React.useEffect(() => {
    const slugs = new Set(published.split(" "));
    prunePendingMessages((entry) => !entry.key && slugs.has(entry.slug));
  }, [entries, published]);

  return entries
    .filter((entry) => !entry.key && !publishedSlugs.includes(entry.slug))
    .toReversed();
}

/**
 * This browser's pending replies in one thread, oldest first. Replies whose
 * key is in `publishedKeys` are removed from storage.
 */
export function usePendingReplies(
  slug: string,
  publishedKeys: readonly string[]
): PendingMessage[] {
  const entries = usePendingEntries();
  const published = publishedKeys.join(" ");

  React.useEffect(() => {
    const keys = new Set(published.split(" "));
    prunePendingMessages(
      (entry) => entry.slug === slug && !!entry.key && keys.has(entry.key)
    );
  }, [entries, slug, published]);

  return entries.filter(
    (entry) =>
      entry.slug === slug && !!entry.key && !publishedKeys.includes(entry.key)
  );
}
