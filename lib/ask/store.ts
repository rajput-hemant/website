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
  /** Also match on the IP hash; used when the visitor arrived without a valid cookie. */
  ipHash: string | null;
  /** ISO time: threads submitted before this are no longer open. */
  openSince: string;
  /** ISO time: answers published after this still hold the cooldown. */
  cooldownSince: string;
};

export type IdentityLimit = "open-thread" | "cooldown" | null;

/** The reads and the write the submission path needs. Faked in tests. */
export type QuestionStore = {
  countPending(): Promise<number>;
  findIdentityLimit(lookup: IdentityLookup): Promise<IdentityLimit>;
  hasPendingDuplicate(body: string): Promise<boolean>;
  createQuestion(question: NewQuestion): Promise<void>;
};

const pendingCountQuery = `count(*[_type == "question" && status == "pending"])`;

const sameIdentity = `(author.anonId == $anonId || ($ipHash != null && moderation.ipHash == $ipHash))`;

// Plain strings rather than defineQuery: typegen cannot follow the interpolated fragment.
// Spam counts as open so a flagged sender cannot keep writing documents.
const identityLimitQuery = `{
  "open": count(*[_type == "question" && ${sameIdentity}
    && submittedAt > $openSince
    && (status in ["pending", "spam"] || (status == "published" && !defined(answer)))]),
  "cooldown": count(*[_type == "question" && ${sameIdentity}
    && status == "published" && defined(answer) && publishedAt > $cooldownSince])
}`;

const pendingDuplicateQuery = `count(*[_type == "question" && status == "pending" && body == $text][0...1])`;

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
    countPending: () => client.fetch<number>(pendingCountQuery, {}, noStore),

    async findIdentityLimit({ anonId, ipHash, openSince, cooldownSince }) {
      const counts = await client.fetch<{ open: number; cooldown: number }>(
        identityLimitQuery,
        { anonId, ipHash, openSince, cooldownSince },
        noStore
      );
      if (counts.open > 0) return "open-thread";
      if (counts.cooldown > 0) return "cooldown";
      return null;
    },

    async hasPendingDuplicate(body) {
      const count = await client.fetch<number>(
        pendingDuplicateQuery,
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
