import { isCircuitOpen } from "./circuit-breaker";
import { askConfig } from "./config";
import { isSpamScore, scoreSubmission } from "./heuristics";
import { type AnonIdentity } from "./identity";
import {
  dailyCap,
  identityLimit,
  type IdentityLimit,
  type SubmitKind,
} from "./limits";
import { parseAskInput, type AskFieldErrors, type AskPayload } from "./schema";
import { createSlug } from "./slug";
import {
  type ModerationRecord,
  type QuestionStore,
  type WrittenStatus,
} from "./store";
import { checkTimeToSubmit } from "./timing";

/** Who is posting. Null when `ASK_COOKIE_SECRET` is unset and identity cannot be signed. */
export type Requester = {
  identity: AnonIdentity;
  /** Salted hash of the client address, or of the shared bucket when it is unknown. */
  ipHash: string;
  /** Whether `ipHash` identifies this client (it came from a trusted proxy). */
  ipTrusted: boolean;
  userAgent: string;
  /** A valid owner session: skips the visitor guards and publishes at once. */
  owner: boolean;
};

export type SubmitTarget = { kind: "thread" } | { kind: "reply"; slug: string };

export type SubmitRequest = {
  target: SubmitTarget;
  payload: unknown;
  requester: Requester | null;
};

export type SubmitDeps = {
  /** Null when Sanity is not configured for writes. */
  store: QuestionStore | null;
  /** Unreviewed count for the circuit breaker, normally cached. */
  getPendingCount: () => Promise<number>;
  now?: () => number;
  createSlug?: () => string;
  createKey?: () => string;
};

export type SubmitResult =
  /** Written to Sanity. `key` is the new reply's `_key`, for replies. */
  | { kind: "accepted"; slug: string; key?: string; status: WrittenStatus }
  /** Looks automated or repeated: answer as if accepted, write nothing. */
  | {
      kind: "discarded";
      slug: string;
      key?: string;
      reason: "honeypot" | "too-fast" | "duplicate";
    }
  /** `fieldErrors` is empty when only the hidden fields were wrong. */
  | { kind: "invalid"; fieldErrors: AskFieldErrors }
  | { kind: "expired" }
  /** Replies only: the thread is missing, or not published (for visitors). */
  | { kind: "not-found" }
  | { kind: "rate-limited"; reason: IdentityLimit }
  | { kind: "unavailable"; reason: "not-configured" | "circuit-open" };

type Message = {
  body: string;
  name?: string;
  status: WrittenStatus;
  anonId?: string;
  moderation?: ModerationRecord;
};

/**
 * Runs the checks cheapest-first (the table in `docs/ask.md`), for new
 * threads and replies alike, so a refused request costs as little as
 * possible and never touches Sanity before the global ceiling has been
 * checked. The owner skips the bot and rate checks and publishes at once.
 * Store errors propagate.
 */
export async function submit(
  { target, payload, requester }: SubmitRequest,
  deps: SubmitDeps
): Promise<SubmitResult> {
  const now = deps.now ?? Date.now;
  const makeSlug = deps.createSlug ?? createSlug;
  const makeKey = deps.createKey ?? (() => crypto.randomUUID());
  const owner = requester?.owner === true;
  const decoy = () =>
    target.kind === "thread"
      ? { slug: makeSlug() }
      : { slug: target.slug, key: makeKey() };

  const parsed = parseAskInput(payload);
  if (!parsed.success) {
    return { kind: "invalid", fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  if (!owner && input.website.trim() !== "") {
    return { kind: "discarded", ...decoy(), reason: "honeypot" };
  }
  const timing = checkTimeToSubmit(input.elapsed);
  if (!owner && !timing.ok) {
    return timing.reason === "too-fast"
      ? { kind: "discarded", ...decoy(), reason: "too-fast" }
      : { kind: "expired" };
  }

  const { store } = deps;
  if (!store || !requester) {
    return { kind: "unavailable", reason: "not-configured" };
  }

  const submittedAt = now();

  if (!owner && isCircuitOpen(await deps.getPendingCount())) {
    return { kind: "unavailable", reason: "circuit-open" };
  }

  let replyTo: { id: string; slug: string } | null = null;
  if (target.kind === "reply") {
    const thread = await store.findThread(target.slug);
    // The owner may answer a thread before approving it; visitors only see published ones.
    if (!thread || (!owner && thread.status !== "published")) {
      return { kind: "not-found" };
    }
    replyTo = { id: thread.id, slug: target.slug };
  }

  let message: Message;
  if (owner) {
    message = { body: input.body, name: input.name, status: "published" };
  } else {
    const limited = await checkIdentityLimits(
      target.kind,
      requester,
      store,
      submittedAt
    );
    if (limited) return limited;

    if (await store.hasUnreviewedDuplicate(input.body)) {
      return { kind: "discarded", ...decoy(), reason: "duplicate" };
    }
    message = screenVisitorMessage(input, requester, timing.elapsedMs);
  }

  const at = new Date(submittedAt).toISOString();
  const publishedAt = message.status === "published" ? at : undefined;

  if (!replyTo) {
    const slug = makeSlug();
    await store.createQuestion({
      by: owner ? "owner" : "visitor",
      body: message.body,
      author: { name: message.name, anonId: message.anonId },
      status: message.status,
      slug,
      submittedAt: at,
      publishedAt,
      lastActivityAt: publishedAt,
      moderation: message.moderation,
    });
    return { kind: "accepted", slug, status: message.status };
  }

  const key = makeKey();
  await store.appendReply(
    replyTo.id,
    {
      _key: key,
      by: owner ? "owner" : "visitor",
      authorName: message.name,
      anonId: message.anonId,
      body: message.body,
      createdAt: at,
      status: message.status,
      moderation: message.moderation,
    },
    publishedAt
  );
  return { kind: "accepted", slug: replyTo.slug, key, status: message.status };
}

async function checkIdentityLimits(
  kind: SubmitKind,
  { identity, ipHash, ipTrusted }: Requester,
  store: QuestionStore,
  submittedAt: number
): Promise<SubmitResult | null> {
  const since = (ms: number) => new Date(submittedAt - ms).toISOString();
  const activity = await store.countIdentityActivity({
    anonId: identity.anonId,
    // The shared bucket says nothing about who is asking; it only feeds the daily cap.
    ipHash: identity.fromCookie || !ipTrusted ? null : ipHash,
    networkHash: ipHash,
    pendingSince: since(askConfig.limits.pendingWindowMs),
    dailySince: since(askConfig.limits.dailyWindowMs),
  });
  const limit = identityLimit(kind, activity, dailyCap(ipTrusted));
  return limit ? { kind: "rate-limited", reason: limit } : null;
}

function screenVisitorMessage(
  input: AskPayload,
  { identity, ipHash, userAgent }: Requester,
  elapsedMs: number
): Message {
  const { score, reasons } = scoreSubmission(
    [input.name, input.body].filter(Boolean).join("\n")
  );
  return {
    body: input.body,
    name: input.name,
    status: isSpamScore(score) ? "spam" : "pending",
    anonId: identity.anonId,
    moderation: {
      score,
      reasons,
      ipHash,
      ua: userAgent.slice(0, askConfig.userAgentMaxLength),
      elapsedMs,
    },
  };
}
