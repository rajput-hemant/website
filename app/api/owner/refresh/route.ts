import type { NextRequest } from "next/server";

import { getClientAddress, hasJsonContentType } from "@/lib/ask/http";
import { createAttemptLimiter } from "@/lib/ask/owner";
import { isOwnerRequest } from "@/lib/ask/owner-session";
import { askMessages, type RefreshSiteResponse } from "@/lib/ask/response";
import {
  errorResponse,
  jsonResponse,
  rejectCrossSite,
} from "@/lib/ask/route-helpers";
import { expireAllSanityTags } from "@/lib/owner/refresh";

export const runtime = "nodejs";

/** A light guard against a stuck button or a script: a few refreshes a minute. */
const refreshes = createAttemptLimiter({ maxFailures: 6, windowMs: 60_000 });

/**
 * Owner only: expires every Sanity cache tag so the static pages regenerate
 * from the dataset on their next request. The manual fallback for the webhook.
 */
export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  // Older browsers omit Sec-Fetch-Site; a JSON body can't come from a cross-site form.
  if (!hasJsonContentType(request.headers)) {
    return errorResponse(askMessages.unsupported, 415);
  }
  if (!(await isOwnerRequest(request))) {
    return errorResponse(askMessages.ownerUnauthorized, 401);
  }

  const bucket = getClientAddress(request.headers).ip;
  if (refreshes.isLocked(bucket)) {
    return errorResponse(askMessages.refreshLimited, 429);
  }
  refreshes.recordFailure(bucket);

  return jsonResponse<RefreshSiteResponse>({
    ok: true,
    tags: [...expireAllSanityTags()],
  });
}
