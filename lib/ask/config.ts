/**
 * Every limit and threshold used by the /ask submission path.
 *
 * This module is imported by the client form (via `schema.ts`), so it must not
 * read secrets. `ASK_PENDING_CAP` is the only environment override: it lets the
 * owner raise or lower the circuit-breaker ceiling without a code change.
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
    email: { max: 254 },
    honeypot: { max: 500 },
  },

  /** Requests larger than this are refused before JSON parsing. */
  maxRequestBytes: 4 * 1024,

  /** Accepted time between the form mounting and the submission. */
  timeToSubmit: { minMs: 3_000, maxMs: 6 * 60 * 60 * 1000 },

  limits: {
    /** A thread stays open until it is answered or this much time passes. */
    openThreadMs: 7 * DAY_MS,
    /** Wait after the owner's answer before the same identity can ask again. */
    cooldownAfterAnswerMs: DAY_MS,
    /** Follow-ups inside one's own open thread (reply route not built yet). */
    repliesPerDay: 3,
  },

  circuitBreaker: {
    /** Pending submissions above which /api/ask answers 503. */
    pendingCap: readPositiveInt(process.env.ASK_PENDING_CAP, 200),
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

  slugLength: 8,
  userAgentMaxLength: 300,
} as const;

export type AskConfig = typeof askConfig;
