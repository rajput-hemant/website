/**
 * Every limit and threshold used by the /ask submission path.
 *
 * This module is imported by the client form (via `schema.ts`), so it must not
 * read secrets. `ASK_PENDING_CAP` is the only environment override here: it lets
 * the owner raise or lower the circuit-breaker ceiling without a code change.
 * `ASK_TRUST_PROXY` is server-only and read in `http.ts`.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const askConfig = {
  fields: {
    body: { min: 10, max: 1000 },
    name: { max: 60 },
    honeypot: { max: 500 },
  },

  /** Requests larger than this are refused before JSON parsing. */
  maxRequestBytes: 4 * 1024,

  /** Accepted time between the form mounting and the submission. */
  timeToSubmit: { minMs: 3_000, maxMs: 6 * 60 * 60 * 1000 },

  limits: {
    /**
     * Pending (or flagged) messages older than this stop counting toward the
     * per-identity pending limits, so a forgotten inbox never locks a visitor out.
     */
    pendingWindowMs: 7 * DAY_MS,
    /** Threads one identity may have waiting for approval at once. */
    pendingThreadsPerIdentity: 1,
    /** Replies one identity may have waiting for approval at once, across threads. */
    pendingRepliesPerIdentity: 3,
    /** Replies per identity per `dailyWindowMs`, whatever their status. */
    repliesPerDay: 10,
    /** Rolling window for the per-network caps below. */
    dailyWindowMs: DAY_MS,
    /** Submissions per IP hash per window, cookie or not, behind a trusted proxy. */
    dailyPerIp: 5,
    /**
     * Without a trusted proxy the client address is unknown, so every visitor
     * shares one bucket and this acts as a global daily cap.
     */
    dailyWithoutTrustedProxy: 30,
  },

  circuitBreaker: {
    /** Unreviewed submissions (see `spamWindowMs`) at which /api/ask answers 503. */
    pendingCap: readPositiveInt(process.env.ASK_PENDING_CAP, 200),
    /**
     * Spam submitted within this window counts toward the cap alongside
     * pending, so a flood of flagged messages closes the form instead of
     * writing documents without bound, while old spam left in the inbox does
     * not keep it closed.
     */
    spamWindowMs: DAY_MS,
    /** How long the pending count is reused before Sanity is asked again. */
    cacheTtlMs: 30_000,
  },

  heuristics: {
    /** Scores at or above this are stored as `spam` instead of `pending`. */
    spamThreshold: 3,
    /** Links allowed before each extra one adds `linkWeight`. */
    freeLinks: 1,
    linkWeight: 2,
    /** A single character repeated this many times in a row. */
    repeatedRunLength: 8,
    repeatedWeight: 2,
    /** Uppercase share of letters, only judged once there are enough letters. */
    capsRatio: 0.7,
    capsMinLetters: 20,
    capsWeight: 2,
    profanityWeight: 2,
  },

  identity: {
    cookieName: "hr_anon",
    cookieMaxAgeSeconds: 365 * 24 * 60 * 60,
    ipHashLength: 12,
  },

  owner: {
    cookieName: "hr_owner",
    sessionMaxAgeSeconds: 30 * 24 * 60 * 60,
    /** Failed sign-ins per client-address bucket before the form locks. */
    maxFailedAttempts: 5,
    failedAttemptWindowMs: 15 * 60 * 1000,
  },

  moderation: {
    /** Spam newer than this is listed in the owner's moderation strip. */
    spamWindowMs: 7 * DAY_MS,
  },

  slugLength: 8,
  userAgentMaxLength: 300,
} as const;

export type AskConfig = typeof askConfig;
