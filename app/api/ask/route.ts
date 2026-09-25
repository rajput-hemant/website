import { NextResponse, type NextRequest } from "next/server";

import { createPendingCounter } from "@/lib/ask/circuit-breaker";
import { askConfig } from "@/lib/ask/config";
import { getClientIp, parseJson, readBodyWithLimit } from "@/lib/ask/http";
import {
  hashIp,
  resolveAnonIdentity,
  type AnonIdentity,
} from "@/lib/ask/identity";
import { askMessages, type AskResponse } from "@/lib/ask/response";
import { getQuestionStore } from "@/lib/ask/store";
import { submit, type Requester, type SubmitResult } from "@/lib/ask/submit";

export const runtime = "nodejs";

const pendingCounter = createPendingCounter(async () => {
  const store = getQuestionStore();
  if (!store) throw new Error("Sanity is not configured for writes");
  return store.countPending();
});

function json(
  body: AskResponse,
  status: number,
  identity?: AnonIdentity | null
) {
  const response = NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
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

function toResponse(result: SubmitResult, identity: AnonIdentity | null) {
  switch (result.kind) {
    case "accepted":
    case "discarded":
      return json({ ok: true, slug: result.slug }, 200, identity);
    case "invalid": {
      const hasFieldErrors = Object.keys(result.fieldErrors).length > 0;
      return json(
        hasFieldErrors
          ? {
              ok: false,
              message: askMessages.invalid,
              fieldErrors: result.fieldErrors,
            }
          : { ok: false, message: askMessages.malformed },
        400,
        identity
      );
    }
    case "expired":
      return json({ ok: false, message: askMessages.expired }, 400, identity);
    case "rate-limited":
      return json(
        {
          ok: false,
          message:
            result.reason === "cooldown"
              ? askMessages.cooldown
              : askMessages.openThread,
        },
        429,
        identity
      );
    case "unavailable":
      return json(
        {
          ok: false,
          message:
            result.reason === "circuit-open"
              ? askMessages.circuitOpen
              : askMessages.notConfigured,
        },
        503,
        identity
      );
  }
}

async function identifyRequester(
  request: NextRequest
): Promise<Requester | null> {
  const secret = process.env.ASK_COOKIE_SECRET;
  if (!secret) return null;
  const cookie = request.cookies.get(askConfig.identity.cookieName)?.value;
  const [identity, ipHash] = await Promise.all([
    resolveAnonIdentity(cookie, secret),
    hashIp(getClientIp(request.headers), secret),
  ]);
  return {
    identity,
    ipHash,
    userAgent: request.headers.get("user-agent") ?? "",
  };
}

export async function POST(request: NextRequest) {
  const body = await readBodyWithLimit(request, askConfig.maxRequestBytes);
  if (!body.ok) return json({ ok: false, message: askMessages.tooLarge }, 413);

  const parsed = parseJson(body.text);
  if (!parsed.ok) {
    return json({ ok: false, message: askMessages.malformed }, 400);
  }

  const requester = await identifyRequester(request);
  const identity = requester?.identity ?? null;

  try {
    const result = await submit(
      { payload: parsed.value, requester },
      { store: getQuestionStore(), getPendingCount: pendingCounter.get }
    );
    return toResponse(result, identity);
  } catch (error) {
    console.error("[api/ask] submission failed", error);
    return json({ ok: false, message: askMessages.failed }, 500, identity);
  }
}
