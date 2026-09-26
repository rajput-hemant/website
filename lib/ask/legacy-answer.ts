import { toPlainText } from "@portabletext/toolkit";

import type { NewReply } from "./store";

/**
 * Before threads, the owner answered in a rich-text `answer` field. It now
 * becomes a published owner reply with this fixed key, so the migration is
 * idempotent and the public mapper can fold unmigrated answers the same way
 * without ever showing one twice.
 */
export const LEGACY_ANSWER_KEY = "legacy-answer";

/** The answer as plain text (chat messages are plain text), or "" when empty. */
export function legacyAnswerText(answer: unknown): string {
  if (!Array.isArray(answer) || answer.length === 0) return "";
  return toPlainText(answer as Parameters<typeof toPlainText>[0]).trim();
}

export type LegacyAnswerSource = {
  answer?: unknown;
  publishedAt?: string | null;
  submittedAt?: string | null;
};

/** The owner reply an answer turns into, or null when there is no answer text. */
export function legacyAnswerReply(
  source: LegacyAnswerSource,
  fallbackTime: string
): NewReply | null {
  const body = legacyAnswerText(source.answer);
  if (body === "") return null;
  return {
    _key: LEGACY_ANSWER_KEY,
    by: "owner",
    body,
    createdAt: source.publishedAt ?? source.submittedAt ?? fallbackTime,
    status: "published",
  };
}

export type LegacyAnswerDocument = LegacyAnswerSource & {
  _id: string;
  lastActivityAt?: string | null;
  replies?: { _key?: string | null }[] | null;
};

/** Operations for `client.patch(id, operations)` or `transaction.patch(id, operations)`. */
export type LegacyAnswerMigration = {
  id: string;
  operations: {
    setIfMissing: { replies: [] };
    insert: { after: "replies[-1]"; items: (NewReply & { _type: "reply" })[] };
    set: { lastActivityAt: string };
  };
};

/**
 * For `bun run doctor --fix`: turns a legacy `answer` into a published owner
 * reply appended to `replies`. Returns null when there is nothing to migrate
 * (no answer text, or already migrated). The `answer` field is left in place,
 * read-only, until it is dropped from the schema.
 */
export function migrateLegacyAnswer(
  doc: LegacyAnswerDocument,
  now: string = new Date().toISOString()
): LegacyAnswerMigration | null {
  if (doc.replies?.some((reply) => reply._key === LEGACY_ANSWER_KEY)) {
    return null;
  }
  const reply = legacyAnswerReply(doc, now);
  if (!reply) return null;

  const lastActivityAt =
    doc.lastActivityAt && doc.lastActivityAt > reply.createdAt
      ? doc.lastActivityAt
      : reply.createdAt;

  return {
    id: doc._id,
    operations: {
      setIfMissing: { replies: [] },
      insert: { after: "replies[-1]", items: [{ _type: "reply", ...reply }] },
      set: { lastActivityAt },
    },
  };
}
