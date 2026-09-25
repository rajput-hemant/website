import { revalidateTag } from "next/cache";
import { type NextRequest, type NextResponse } from "next/server";

import { createPendingCounter } from "./circuit-breaker";
import { askConfig } from "./config";
import { getClientAddress } from "./http";
import { hashIp, resolveAnonIdentity, type AnonIdentity } from "./identity";
import { type IdentityLimit } from "./limits";
import { isOwnerRequest } from "./owner-session";
import {
  askMessages,
  type AskErrorResponse,
  type AskPostResponse,
  type ReplyResponse,
} from "./response";
import { jsonResponse, readJsonRequest } from "./route-helpers";
import { getQuestionStore } from "./store";
import {
  submit,
  type Requester,
  type SubmitResult,
  type SubmitTarget,
} from "./submit";

/** The one handler behind `POST /api/ask` and `POST /api/ask/[slug]/replies`. */

const pendingCounter = createPendingCounter(async () => {
  const store = getQuestionStore();
  if (!store) throw new Error("Sanity is not configured for writes");
  const spamSince = Date.now() - askConfig.circuitBreaker.spamWindowMs;
  return store.countAwaitingReview(new Date(spamSince).toISOString());
});

const rateLimitMessages: Record<IdentityLimit, string> = {
  "pending-thread": askMessages.pendingThread,
  "pending-replies": askMessages.pendingReplies,
  "reply-cap": askMessages.replyCap,
  "daily-cap": askMessages.dailyCap,
};

function withIdentityCookie(
  response: NextResponse,
  identity: AnonIdentity | null
): NextResponse {
  if (identity?.cookieValue) {
    response.cookies.set(askConfig.identity.cookieName, identity.cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: askConfig.identity.cookieMaxAgeSeconds,
    });
  }
  return response;
}

function error(
  message: string,
  status: number,
  extra?: Partial<AskErrorResponse>
) {
  return jsonResponse<AskErrorResponse>(
    { ok: false, message, ...extra },
    status
  );
}

function toResponse(result: SubmitResult): NextResponse {
  switch (result.kind) {
    case "accepted":
    case "discarded": {
      const status =
        result.kind === "accepted" && result.status === "published"
          ? "published"
          : "pending";
      return jsonResponse<AskPostResponse | ReplyResponse>(
        result.key === undefined
          ? { ok: true, slug: result.slug, status }
          : { ok: true, slug: result.slug, key: result.key, status }
      );
    }
    case "invalid":
      return Object.keys(result.fieldErrors).length > 0
        ? error(askMessages.invalid, 400, { fieldErrors: result.fieldErrors })
        : error(askMessages.malformed, 400);
    case "expired":
      return error(askMessages.expired, 400);
    case "not-found":
      return error(askMessages.threadNotFound, 404);
    case "rate-limited":
      return error(rateLimitMessages[result.reason], 429);
    case "unavailable":
      return error(
        result.reason === "circuit-open"
          ? askMessages.circuitOpen
          : askMessages.notConfigured,
        503
      );
  }
}

async function identifyRequester(
  request: NextRequest
): Promise<Requester | null> {
  const secret = process.env.ASK_COOKIE_SECRET;
  if (!secret) return null;
  const cookie = request.cookies.get(askConfig.identity.cookieName)?.value;
  const address = getClientAddress(request.headers);
  const [identity, ipHash, owner] = await Promise.all([
    resolveAnonIdentity(cookie, secret),
    hashIp(address.ip, secret),
    isOwnerRequest(request),
  ]);
  return {
    identity,
    ipHash,
    ipTrusted: address.trusted,
    userAgent: request.headers.get("user-agent") ?? "",
    owner,
  };
}

export async function handleSubmission(
  request: NextRequest,
  target: SubmitTarget
): Promise<NextResponse> {
  const body = await readJsonRequest(request);
  if (!body.ok) return body.response;

  const requester = await identifyRequester(request);
  // The owner's own messages never need a visitor identity.
  const identity = requester?.owner ? null : (requester?.identity ?? null);

  try {
    const result = await submit(
      { target, payload: body.value, requester },
      { store: getQuestionStore(), getPendingCount: pendingCounter.get }
    );
    if (result.kind === "accepted" && result.status === "published") {
      revalidateTag("question", { expire: 0 });
    }
    return withIdentityCookie(toResponse(result), identity);
  } catch (cause) {
    console.error(`[api/ask] ${target.kind} submission failed`, cause);
    return withIdentityCookie(error(askMessages.failed, 500), identity);
  }
}
