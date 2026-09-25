import { createClient, type SanityClient } from "next-sanity";

import { env, isSanityConfigured } from "@/lib/env";

/** The `question` document as written by the submission route. */
export type NewQuestion = {
  body: string;
  author: { name?: string; email?: string; anonId: string };
  status: "pending" | "spam";
  slug: string;
  submittedAt: string;
  moderation: {
    score: number;
    reasons: string[];
    ipHash: string;
    ua: string;
    elapsedMs: number;
  };
};

export type IdentityLookup = {
  anonId: string;
  /**
   * Also match threads on this IP hash: set when the visitor arrived without a
   * valid cookie and the address came from a trusted proxy.
   */
  ipHash: string | null;
  /** The requester's IP hash (or the shared bucket's), counted for the daily cap. */
  networkHash: string;
  /** ISO time: threads submitted before this are no longer open. */
  openSince: string;
  /** ISO time: answers published after this still hold the cooldown. */
  cooldownSince: string;
  /** ISO time: submissions after this count toward the daily cap. */
  dailySince: string;
};

export type IdentityActivity = {
  /** Open threads for this identity. */
  open: number;
  /** Answers still inside the cooldown. */
  cooldown: number;
  /** Submissions from this network since `dailySince`, whatever their status. */
  today: number;
};

/** The reads and the write the submission path needs. Faked in tests. */
export type QuestionStore = {
  /** Pending submissions plus spam submitted after `spamSince` (ISO). */
  countAwaitingReview(spamSince: string): Promise<number>;
  countIdentityActivity(lookup: IdentityLookup): Promise<IdentityActivity>;
  /** Whether the same body is already pending or flagged as spam. */
  hasUnreviewedDuplicate(body: string): Promise<boolean>;
  createQuestion(question: NewQuestion): Promise<void>;
};

const awaitingReviewQuery = `count(*[_type == "question"
  && (status == "pending" || (status == "spam" && submittedAt > $spamSince))])`;

const sameIdentity = `(author.anonId == $anonId || ($ipHash != null && moderation.ipHash == $ipHash))`;

// Plain strings rather than defineQuery: typegen cannot follow the interpolated fragment.
// Spam counts as open so a flagged sender cannot keep writing documents.
const identityActivityQuery = `{
  "open": count(*[_type == "question" && ${sameIdentity}
    && submittedAt > $openSince
    && (status in ["pending", "spam"] || (status == "published" && !defined(answer)))]),
  "cooldown": count(*[_type == "question" && ${sameIdentity}
    && status == "published" && defined(answer) && publishedAt > $cooldownSince]),
  "today": count(*[_type == "question" && moderation.ipHash == $networkHash
    && submittedAt > $dailySince])
}`;

const unreviewedDuplicateQuery = `count(*[_type == "question" && status in ["pending", "spam"] && body == $text][0...1])`;

/** Server-only secret, read where it is used. */
function readWriteToken(): string {
  return process.env.SANITY_API_WRITE_TOKEN ?? "";
}

/** True when submissions can be stored: a project id and an Editor token. */
export function isAskStoreConfigured(): boolean {
  return isSanityConfigured && readWriteToken().length > 0;
}

function createWriteClient(): SanityClient {
  return createClient({
    projectId: env.sanity.projectId,
    dataset: env.sanity.dataset,
    apiVersion: env.sanity.apiVersion,
    token: readWriteToken(),
    useCdn: false,
    perspective: "published",
  });
}

export function createSanityQuestionStore(
  client: SanityClient = createWriteClient()
): QuestionStore {
  const noStore = { cache: "no-store" } as const;

  return {
    countAwaitingReview: (spamSince) =>
      client.fetch<number>(awaitingReviewQuery, { spamSince }, noStore),

    countIdentityActivity: (lookup) =>
      client.fetch<IdentityActivity>(identityActivityQuery, lookup, noStore),

    async hasUnreviewedDuplicate(body) {
      const count = await client.fetch<number>(
        unreviewedDuplicateQuery,
        { text: body },
        noStore
      );
      return count > 0;
    },

    async createQuestion(question) {
      await client.create({
        _type: "question",
        body: question.body,
        author: { kind: "anonymous", ...question.author },
        status: question.status,
        // A plain string, matching `sanity/schemas/question.ts` and the public queries.
        slug: question.slug,
        submittedAt: question.submittedAt,
        replies: [],
        moderation: question.moderation,
      });
    },
  };
}

let sharedStore: QuestionStore | null = null;

/** The process-wide store, or null when Sanity is not configured for writes. */
export function getQuestionStore(): QuestionStore | null {
  if (!isAskStoreConfigured()) return null;
  sharedStore ??= createSanityQuestionStore();
  return sharedStore;
}
