import { isCircuitOpen } from "./circuit-breaker";
import { askConfig } from "./config";
import { isSpamScore, scoreSubmission } from "./heuristics";
import { type AnonIdentity } from "./identity";
import { parseAskInput, type AskFieldErrors } from "./schema";
import { createSlug } from "./slug";
import { type QuestionStore } from "./store";
import { checkTimeToSubmit } from "./timing";

/** Who is asking. Null when `ASK_COOKIE_SECRET` is unset and identity cannot be signed. */
export type Requester = {
  identity: AnonIdentity;
  ipHash: string;
  userAgent: string;
};

export type SubmitRequest = {
  payload: unknown;
  requester: Requester | null;
};

export type SubmitDeps = {
  /** Null when Sanity is not configured for writes. */
  store: QuestionStore | null;
  /** Pending count for the circuit breaker, normally cached. */
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
  | { kind: "rate-limited"; reason: "open-thread" | "cooldown" }
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

  const submittedAt = now();
  const timing = checkTimeToSubmit(input.t, submittedAt);
  if (!timing.ok) {
    return timing.reason === "too-fast"
      ? { kind: "discarded", slug: makeSlug(), reason: "too-fast" }
      : { kind: "expired" };
  }

  const { store } = deps;
  if (!store || !requester) {
    return { kind: "unavailable", reason: "not-configured" };
  }

  if (isCircuitOpen(await deps.getPendingCount())) {
    return { kind: "unavailable", reason: "circuit-open" };
  }

  const { identity, ipHash, userAgent } = requester;
  const limit = await store.findIdentityLimit({
    anonId: identity.anonId,
    ipHash: identity.fromCookie ? null : ipHash,
    openSince: new Date(
      submittedAt - askConfig.limits.openThreadMs
    ).toISOString(),
    cooldownSince: new Date(
      submittedAt - askConfig.limits.cooldownAfterAnswerMs
    ).toISOString(),
  });
  if (limit) return { kind: "rate-limited", reason: limit };

  if (await store.hasPendingDuplicate(input.body)) {
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
