import { type NextRequest } from "next/server";

import { handleSubmission } from "@/lib/ask/submission-route";

export const runtime = "nodejs";

/** Starts a thread: pending for visitors, published at once for the owner. */
export function POST(request: NextRequest) {
  return handleSubmission(request, { kind: "thread" });
}
