import { NextResponse } from "next/server";

import { askConfig } from "./config";
import {
  hasJsonContentType,
  isCrossSiteRequest,
  parseJson,
  readBodyWithLimit,
} from "./http";
import { askMessages, type AskErrorResponse } from "./response";

/** Every /ask and owner endpoint answers uncached JSON. */
export function jsonResponse<Body>(body: Body, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function errorResponse(message: string, status: number): NextResponse {
  return jsonResponse<AskErrorResponse>({ ok: false, message }, status);
}

/** 403 for a request the browser labelled cross-site, otherwise null. */
export function rejectCrossSite(request: Request): NextResponse | null {
  return isCrossSiteRequest(request.headers)
    ? errorResponse(askMessages.unsupported, 403)
    : null;
}

/**
 * The shared guards for state-changing JSON endpoints, cheapest first:
 * same-origin (403), JSON only (415), size cap (413), parseable (400).
 */
export async function readJsonRequest(
  request: Request,
  maxBytes: number = askConfig.maxRequestBytes
): Promise<
  { ok: true; value: unknown } | { ok: false; response: NextResponse }
> {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return { ok: false, response: crossSite };
  if (!hasJsonContentType(request.headers)) {
    return { ok: false, response: errorResponse(askMessages.unsupported, 415) };
  }
  const body = await readBodyWithLimit(request, maxBytes);
  if (!body.ok) {
    return { ok: false, response: errorResponse(askMessages.tooLarge, 413) };
  }
  const parsed = parseJson(body.text);
  return parsed.ok
    ? { ok: true, value: parsed.value }
    : { ok: false, response: errorResponse(askMessages.malformed, 400) };
}
