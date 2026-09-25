import { isCircuitOpen } from "./circuit-breaker";
import { askConfig } from "./config";
import { isSpamScore, scoreSubmission } from "./heuristics";
import { type AnonIdentity } from "./identity";
import { dailyCap, identityLimit, type IdentityLimit } from "./limits";
import { parseAskInput, type AskFieldErrors } from "./schema";
import { createSlug } from "./slug";
import { type QuestionStore } from "./store";
import { checkTimeToSubmit } from "./timing";

/** Who is asking. Null when `ASK_COOKIE_SECRET` is unset and identity cannot be signed. */
export type Requester = {
  identity: AnonIdentity;
  /** Salted hash of the client address, or of the shared bucket when it is unknown. */
  ipHash: string;
  /** Whether `ipHash` identifies this client (it came from a trusted proxy). */
  ipTrusted: boolean;
  userAgent: string;
};

export type SubmitRequest = {
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
};

export type SubmitResult =
  /** Written to Sanity as `pending` or `spam`. */
  | { kind: "accepted"; slug: string; status: "pending" | "spam" }
  /** Looks automated or repeated: answer as if accepted, write nothing. */
  | {
      kind: "discarded";
      slug: string;
      reason: "honeypot" | "too-fast" | "duplicate";
    }
  /** `fieldErrors` is empty when only the hidden fields were wrong. */
  | { kind: "invalid"; fieldErrors: AskFieldErrors }
  | { kind: "expired" }
  | { kind: "rate-limited"; reason: IdentityLimit }
  | { kind: "unavailable"; reason: "not-configured" | "circuit-open" };

/**
 * Runs the checks cheapest-first (rows 2 to 6 and 8 of the table in plan 5.5),
 * so a refused request costs as little as possible and never touches Sanity
 * before the global ceiling has been checked. Store errors propagate.
 */
export async function submit(
  { payload, requester }: SubmitRequest,
  deps: SubmitDeps
): Promise<SubmitResult> {
  const now = deps.now ?? Date.now;
  const makeSlug = deps.createSlug ?? createSlug;

  const parsed = parseAskInput(payload);
  if (!parsed.success) {
    return { kind: "invalid", fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  if (input.website.trim() !== "") {
    return { kind: "discarded", slug: makeSlug(), reason: "honeypot" };
  }

  const timing = checkTimeToSubmit(input.elapsed);
  if (!timing.ok) {
    return timing.reason === "too-fast"
      ? { kind: "discarded", slug: makeSlug(), reason: "too-fast" }
      : { kind: "expired" };
  }

  const { store } = deps;
  if (!store || !requester) {
    return { kind: "unavailable", reason: "not-configured" };
  }

  const submittedAt = now();

  if (isCircuitOpen(await deps.getPendingCount())) {
    return { kind: "unavailable", reason: "circuit-open" };
  }

  const { identity, ipHash, ipTrusted, userAgent } = requester;
  const since = (ms: number) => new Date(submittedAt - ms).toISOString();
  const activity = await store.countIdentityActivity({
    anonId: identity.anonId,
    // The shared bucket says nothing about who is asking; it only feeds the daily cap.
    ipHash: identity.fromCookie || !ipTrusted ? null : ipHash,
    networkHash: ipHash,
    openSince: since(askConfig.limits.openThreadMs),
    cooldownSince: since(askConfig.limits.cooldownAfterAnswerMs),
    dailySince: since(askConfig.limits.dailyWindowMs),
  });
  const limit = identityLimit(activity, dailyCap(ipTrusted));
  if (limit) return { kind: "rate-limited", reason: limit };

  if (await store.hasUnreviewedDuplicate(input.body)) {
    return { kind: "discarded", slug: makeSlug(), reason: "duplicate" };
  }

  const { score, reasons } = scoreSubmission(
    [input.name, input.body].filter(Boolean).join("\n")
  );
  const status = isSpamScore(score) ? "spam" : "pending";
  const slug = makeSlug();

  await store.createQuestion({
    body: input.body,
    author: { name: input.name, email: input.email, anonId: identity.anonId },
    status,
    slug,
    submittedAt: new Date(submittedAt).toISOString(),
    moderation: {
      score,
      reasons,
      ipHash,
      ua: userAgent.slice(0, askConfig.userAgentMaxLength),
      elapsedMs: timing.elapsedMs,
    },
  });

  return { kind: "accepted", slug, status };
}
