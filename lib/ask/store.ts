import "server-only";

import { createClient, type SanityClient } from "next-sanity";

import type { MessageAuthor, MessageStatus } from "@/lib/data/types";
import { env, isSanityConfigured, readSanityWriteToken } from "@/lib/env";

import type { ModerationQueueRows, ModerationThread } from "./moderation";

/** Private triage data kept on every visitor message; never selected publicly. */
export type ModerationRecord = {
  score: number;
  reasons: string[];
  ipHash: string;
  ua: string;
  elapsedMs: number;
};

/** Visitor messages land as pending or spam; the owner's publish at once. */
export type WrittenStatus = "pending" | "spam" | "published";

/** The `question` (thread) document as written by the submission routes. */
export type NewQuestion = {
  by: MessageAuthor;
  body: string;
  author: { name?: string; anonId?: string };
  status: WrittenStatus;
  slug: string;
  submittedAt: string;
  /** Set when the thread is published on creation (owner posts). */
  publishedAt?: string;
  lastActivityAt?: string;
  moderation?: ModerationRecord;
};

/** One `replies[]` item as appended by the reply route. */
export type NewReply = {
  _key: string;
  by: MessageAuthor;
  authorName?: string;
  anonId?: string;
  body: string;
  createdAt: string;
  status: WrittenStatus;
  moderation?: ModerationRecord;
};

export type ThreadRef = { id: string; status: MessageStatus };

export type IdentityLookup = {
  anonId: string;
  /**
   * Also match messages on this IP hash: set when the visitor arrived without a
   * valid cookie and the address came from a trusted proxy.
   */
  ipHash: string | null;
  /** The requester's IP hash (or the shared bucket's), counted for the daily cap. */
  networkHash: string;
  /** ISO time: pending messages older than this no longer count. */
  pendingSince: string;
  /** ISO time: messages after this count toward the daily caps. */
  dailySince: string;
};

export type IdentityActivity = {
  /** Threads by this identity waiting for approval (or flagged as spam). */
  pendingThreads: number;
  /** Replies by this identity waiting for approval (or flagged as spam), across threads. */
  pendingReplies: number;
  /** Replies by this identity since `dailySince`, whatever their status. */
  repliesToday: number;
  /** Threads and replies from this network since `dailySince`, whatever their status. */
  today: number;
};

/** The reads and writes the submission pipeline needs. Faked in tests. */
export type QuestionStore = {
  /** Pending threads and replies, plus spam submitted after `spamSince` (ISO). */
  countAwaitingReview(spamSince: string): Promise<number>;
  countIdentityActivity(lookup: IdentityLookup): Promise<IdentityActivity>;
  /** Whether the same body is already pending or flagged as spam, as a thread or a reply. */
  hasUnreviewedDuplicate(body: string): Promise<boolean>;
  findThread(slug: string): Promise<ThreadRef | null>;
  createQuestion(question: NewQuestion): Promise<void>;
  /** Appends atomically; `lastActivityAt` is set in the same patch when given. */
  appendReply(
    threadId: string,
    reply: NewReply,
    lastActivityAt?: string
  ): Promise<void>;
};

/** The reads and writes the owner's moderation routes need. */
export type ModerationStore = {
  listModerationQueue(spamSince: string): Promise<ModerationQueueRows>;
  findThreadForModeration(slug: string): Promise<ModerationThread | null>;
  setFields(threadId: string, fields: Record<string, unknown>): Promise<void>;
};

type CountRows = { n: number }[];

const sum = (rows: CountRows) => rows.reduce((total, row) => total + row.n, 0);

/**
 * Per-document counts of matching replies, summed in JS: `count()` over a
 * nested filter is well supported, flattening across documents less so.
 */
const replyCounts = (filter: string) =>
  `*[_type == "question" && count(replies[${filter}]) > 0]{ "n": count(replies[${filter}]) }`;

const unreviewed = `status in ["pending", "spam"]`;
const awaitingReviewThread = `status == "pending" || (status == "spam" && submittedAt > $spamSince)`;
const awaitingReviewReply = `status == "pending" || (status == "spam" && createdAt > $spamSince)`;

// Plain strings rather than defineQuery: typegen cannot follow the interpolated fragments.
const awaitingReviewQuery = `{
  "threads": count(*[_type == "question" && (${awaitingReviewThread})]),
  "replies": ${replyCounts(awaitingReviewReply)}
}`;

const sameThreadAuthor = `(author.anonId == $anonId || ($ipHash != null && moderation.ipHash == $ipHash))`;
const sameReplyAuthor = `(anonId == $anonId || ($ipHash != null && moderation.ipHash == $ipHash))`;

// Spam counts as pending so a flagged sender cannot keep writing documents.
const identityActivityQuery = `{
  "pendingThreads": count(*[_type == "question" && ${sameThreadAuthor}
    && ${unreviewed} && submittedAt > $pendingSince]),
  "pendingReplies": ${replyCounts(`${sameReplyAuthor} && ${unreviewed} && createdAt > $pendingSince`)},
  "repliesToday": ${replyCounts(`${sameReplyAuthor} && createdAt > $dailySince`)},
  "threadsFromNetwork": count(*[_type == "question" && moderation.ipHash == $networkHash
    && submittedAt > $dailySince]),
  "repliesFromNetwork": ${replyCounts(`moderation.ipHash == $networkHash && createdAt > $dailySince`)}
}`;

const unreviewedDuplicateQuery = `count(*[_type == "question" && (
  (${unreviewed} && body == $text) || count(replies[${unreviewed} && body == $text]) > 0
)][0...1])`;

const threadRefQuery = `*[_type == "question" && slug == $slug][0]{ "id": _id, status }`;

const moderationThreadQuery = `*[_type == "question" && slug == $slug][0]{
  _id, status, publishedAt, "replyKeys": replies[]._key
}`;

const moderationQueueQuery = `{
  "threads": *[_type == "question" && (${awaitingReviewThread})]
    | order(submittedAt desc) [0...200]
    { slug, body, "authorName": author.name, submittedAt, status },
  "replies": *[_type == "question" && count(replies[${awaitingReviewReply}]) > 0]
    | order(coalesce(lastActivityAt, submittedAt) desc) [0...200]
    { slug, body, "replies": replies[${awaitingReviewReply}]{ _key, by, authorName, body, createdAt, status } }
}`;

/** True when submissions can be stored: a project id and an Editor token. */
export function isAskStoreConfigured(): boolean {
  return isSanityConfigured && readSanityWriteToken().length > 0;
}

function createWriteClient(): SanityClient {
  return createClient({
    projectId: env.sanity.projectId,
    dataset: env.sanity.dataset,
    apiVersion: env.sanity.apiVersion,
    token: readSanityWriteToken(),
    useCdn: false,
    perspective: "published",
  });
}

export function createSanityQuestionStore(
  client: SanityClient = createWriteClient()
): QuestionStore & ModerationStore {
  const noStore = { cache: "no-store" } as const;

  return {
    async countAwaitingReview(spamSince) {
      const result = await client.fetch<{
        threads: number;
        replies: CountRows;
      }>(awaitingReviewQuery, { spamSince }, noStore);
      return result.threads + sum(result.replies);
    },

    async countIdentityActivity(lookup) {
      const result = await client.fetch<{
        pendingThreads: number;
        pendingReplies: CountRows;
        repliesToday: CountRows;
        threadsFromNetwork: number;
        repliesFromNetwork: CountRows;
      }>(identityActivityQuery, lookup, noStore);
      return {
        pendingThreads: result.pendingThreads,
        pendingReplies: sum(result.pendingReplies),
        repliesToday: sum(result.repliesToday),
        today: result.threadsFromNetwork + sum(result.repliesFromNetwork),
      };
    },

    async hasUnreviewedDuplicate(body) {
      const count = await client.fetch<number>(
        unreviewedDuplicateQuery,
        { text: body },
        noStore
      );
      return count > 0;
    },

    async findThread(slug) {
      const result = await client.fetch<{
        id: string;
        status: MessageStatus | null;
      } | null>(threadRefQuery, { slug }, noStore);
      return result
        ? { id: result.id, status: result.status ?? "pending" }
        : null;
    },

    async createQuestion({ by, author, ...question }) {
      await client.create({
        _type: "question",
        ...question,
        author: { kind: by === "owner" ? "owner" : "anonymous", ...author },
        replies: [],
      });
    },

    async appendReply(threadId, reply, lastActivityAt) {
      const patch = client
        .patch(threadId)
        .setIfMissing({ replies: [] })
        .append("replies", [{ _type: "reply", ...reply }]);
      await (lastActivityAt ? patch.set({ lastActivityAt }) : patch).commit();
    },

    listModerationQueue: (spamSince) =>
      client.fetch<ModerationQueueRows>(
        moderationQueueQuery,
        { spamSince },
        noStore
      ),

    findThreadForModeration: (slug) =>
      client.fetch<ModerationThread | null>(
        moderationThreadQuery,
        { slug },
        noStore
      ),

    async setFields(threadId, fields) {
      await client.patch(threadId).set(fields).commit();
    },
  };
}

let sharedStore: (QuestionStore & ModerationStore) | null = null;

/** The process-wide store, or null when Sanity is not configured for writes. */
export function getQuestionStore(): (QuestionStore & ModerationStore) | null {
  if (!isAskStoreConfigured()) return null;
  sharedStore ??= createSanityQuestionStore();
  return sharedStore;
}
