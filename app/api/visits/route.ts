import { visitsConfig } from "@/lib/visits/config";
import {
  handleVisitGet,
  handleVisitPost,
  type VisitDeps,
} from "@/lib/visits/handler";
import { createRateLimiter } from "@/lib/visits/rate-limit";
import { getVisitStore } from "@/lib/visits/store";

export const runtime = "nodejs";

const limiter = createRateLimiter({
  windowMs: visitsConfig.rateLimit.windowMs,
  maxKeys: visitsConfig.rateLimit.maxTrackedKeys,
});

function deps(): VisitDeps {
  return {
    store: getVisitStore(),
    secret: process.env.ASK_COOKIE_SECRET,
    limiter,
    now: Date.now,
    secureCookies: process.env.NODE_ENV === "production",
  };
}

/** The current count, cacheable at the edge for a minute. */
export function GET() {
  return handleVisitGet(deps());
}

/** Counts this browser once per UTC day and returns the total. */
export function POST(request: Request) {
  return handleVisitPost(request, deps());
}
