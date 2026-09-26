import { type NextRequest } from "next/server";

import { askMessages } from "@/lib/ask/response";
import { errorResponse } from "@/lib/ask/route-helpers";
import { isSlug } from "@/lib/ask/slug";
import { handleSubmission } from "@/lib/ask/submission-route";

export const runtime = "nodejs";

/** Replies inside a thread: pending for visitors, published at once for the owner. */
export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/ask/[slug]/replies">
) {
  const { slug } = await params;
  if (!isSlug(slug)) return errorResponse(askMessages.threadNotFound, 404);
  return handleSubmission(request, { kind: "reply", slug });
}
