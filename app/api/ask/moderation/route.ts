import { type NextRequest } from "next/server";

import { askConfig } from "@/lib/ask/config";
import { toModerationItems } from "@/lib/ask/moderation";
import { isOwnerRequest } from "@/lib/ask/owner-session";
import { askMessages, type ModerationResponse } from "@/lib/ask/response";
import { errorResponse, jsonResponse } from "@/lib/ask/route-helpers";
import { getQuestionStore } from "@/lib/ask/store";

export const runtime = "nodejs";

/** Owner only: pending threads and replies plus recent spam, newest first. */
export async function GET(request: NextRequest) {
  if (!(await isOwnerRequest(request))) {
    return errorResponse(askMessages.ownerUnauthorized, 401);
  }
  const store = getQuestionStore();
  if (!store) return errorResponse(askMessages.notConfigured, 503);

  const spamSince = new Date(
    Date.now() - askConfig.moderation.spamWindowMs
  ).toISOString();
  try {
    const rows = await store.listModerationQueue(spamSince);
    return jsonResponse<ModerationResponse>({
      ok: true,
      items: toModerationItems(rows),
    });
  } catch (cause) {
    console.error("[api/ask/moderation] queue read failed", cause);
    return errorResponse(askMessages.failed, 500);
  }
}
