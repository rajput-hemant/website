import {
  getClientAddress,
  hasJsonContentType,
  isCrossSiteRequest,
  parseJson,
  readBodyWithLimit,
  type ClientAddress,
} from "@/lib/ask/http";

import { isLikelyBot } from "./bots";
import { visitsConfig } from "./config";
import { type RateLimiter } from "./rate-limit";
import { type VisitsResponse } from "./response";
import {
  readCookie,
  serializeSeenCookie,
  signSeenCookie,
  verifySeenCookie,
} from "./seen-cookie";
import { type VisitStore } from "./store";

/**
 * `GET` and `POST /api/visits`, free of Next so tests can inject the store,
 * the clock and the limiter. The route file only wires the real ones in.
 */

export type VisitDeps = {
  /** Null when Sanity (or its write token) is not configured. */
  store: VisitStore | null;
  /** `ASK_COOKIE_SECRET`, which also signs the daily `hr_seen` cookie. */
  secret: string | undefined;
  limiter: RateLimiter;
  now: () => number;
  /** Adds `Secure` to the cookie; on in production. */
  secureCookies: boolean;
  clientAddress?: (headers: Headers) => ClientAddress;
};

const noStore = { "Cache-Control": "no-store" };

/** Edge caches absorb reads; the count may lag by a minute. */
export const publicReadCacheControl =
  "public, s-maxage=60, stale-while-revalidate=300";

function json(
  body: VisitsResponse | { error: string },
  status: number,
  headers: HeadersInit = noStore
): Response {
  return Response.json(body, { status, headers });
}

const unavailable = () => json({ error: "Visitor counter is off." }, 503);

/** Empty or JSON only: an HTML form cannot send a JSON body. Returns the error status, or null. */
async function invalidBodyStatus(request: Request): Promise<number | null> {
  const body = await readBodyWithLimit(request, visitsConfig.maxRequestBytes);
  if (!body.ok) return 413;
  if (body.text.trim() === "") return null;
  if (!hasJsonContentType(request.headers)) return 415;
  return parseJson(body.text).ok ? null : 400;
}

export async function handleVisitGet(deps: VisitDeps): Promise<Response> {
  if (!deps.store) return unavailable();
  try {
    const visitors = await deps.store.read();
    return json({ visitors }, 200, { "Cache-Control": publicReadCacheControl });
  } catch (cause) {
    console.error("[api/visits] read failed", cause);
    return unavailable();
  }
}

/**
 * Counts unique visitors per UTC day. Cheapest checks first, and nothing
 * touches Sanity until the request is same-site, well formed and under the
 * per-address limit. Bots and return visits read the count without adding to it.
 */
export async function handleVisitPost(
  request: Request,
  deps: VisitDeps
): Promise<Response> {
  if (isCrossSiteRequest(request.headers)) {
    return json({ error: "Cross-site requests are not accepted." }, 403);
  }
  const bodyError = await invalidBodyStatus(request);
  if (bodyError !== null) {
    return json({ error: "Send an empty or JSON body." }, bodyError);
  }

  const { store, secret } = deps;
  if (!store || !secret) return unavailable();

  const address = (deps.clientAddress ?? getClientAddress)(request.headers);
  const { rateLimit } = visitsConfig;
  const limit = address.trusted ? rateLimit.perAddress : rateLimit.sharedBucket;
  const now = deps.now();
  if (!deps.limiter.take(address.ip, limit, now)) {
    return json({ error: "Too many requests." }, 429);
  }

  try {
    const cookie = readCookie(
      request.headers.get("cookie"),
      visitsConfig.cookieName
    );
    const skipIncrement =
      isLikelyBot(request.headers) ||
      (await verifySeenCookie(cookie, now, secret));
    if (skipIncrement) return json({ visitors: await store.read() }, 200);

    const visitors = await store.increment(new Date(now).toISOString());
    const seen = await signSeenCookie(now, secret);
    return json({ visitors }, 200, {
      ...noStore,
      "Set-Cookie": serializeSeenCookie(
        visitsConfig.cookieName,
        seen,
        now,
        deps.secureCookies
      ),
    });
  } catch (cause) {
    console.error("[api/visits] count failed", cause);
    return unavailable();
  }
}
