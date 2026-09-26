import { revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";

import {
  buildModerationPatch,
  parseModerateRequest,
} from "@/lib/ask/moderation";
import { isOwnerRequest } from "@/lib/ask/owner-session";
import { askMessages, type ModerateResponse } from "@/lib/ask/response";
import {
  errorResponse,
  jsonResponse,
  readJsonRequest,
} from "@/lib/ask/route-helpers";
import { getQuestionStore } from "@/lib/ask/store";

export const runtime = "nodejs";

/** Owner only: publish, reject or mark spam a thread or one of its replies. */
export async function POST(request: NextRequest) {
  if (!(await isOwnerRequest(request))) {
    return errorResponse(askMessages.ownerUnauthorized, 401);
  }
  const body = await readJsonRequest(request);
  if (!body.ok) return body.response;
  const input = parseModerateRequest(body.value);
  if (!input) return errorResponse(askMessages.malformed, 400);

  const store = getQuestionStore();
  if (!store) return errorResponse(askMessages.notConfigured, 503);

  try {
    const thread = await store.findThreadForModeration(input.slug);
    const fields =
      thread && buildModerationPatch(thread, input, new Date().toISOString());
    if (!thread || !fields) {
      return errorResponse(askMessages.moderationNotFound, 404);
    }
    await store.setFields(thread._id, fields);
    revalidateTag("question", { expire: 0 });
    return jsonResponse<ModerateResponse>({ ok: true });
  } catch (cause) {
    console.error("[api/ask/moderate] moderation failed", cause);
    return errorResponse(askMessages.failed, 500);
  }
}
