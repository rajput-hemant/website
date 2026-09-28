import { type NextRequest } from "next/server";

import { getClientAddress } from "@/lib/ask/http";
import {
  createAttemptLimiter,
  isPassphraseCorrect,
  signOwnerSession,
} from "@/lib/ask/owner";
import {
  clearOwnerCookie,
  isOwnerRequest,
  readOwnerSecrets,
  setOwnerCookie,
} from "@/lib/ask/owner-session";
import { askMessages, type OwnerSessionResponse } from "@/lib/ask/response";
import {
  errorResponse,
  jsonResponse,
  readJsonRequest,
  rejectCrossSite,
} from "@/lib/ask/route-helpers";

export const runtime = "nodejs";

/** Passphrases are short; anything bigger is not a sign-in attempt. */
const MAX_SIGN_IN_BYTES = 1024;

const failedAttempts = createAttemptLimiter();

function readPassphrase(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const { passphrase } = value as { passphrase?: unknown };
  return typeof passphrase === "string" && passphrase.length > 0
    ? passphrase
    : null;
}

/** Whether this browser holds a valid owner session. Read only by client code. */
export async function GET(request: NextRequest) {
  return jsonResponse<OwnerSessionResponse>({
    owner: await isOwnerRequest(request),
  });
}

/** Exchanges `ASK_OWNER_PASSPHRASE` for the signed `hr_owner` cookie. */
export async function POST(request: NextRequest) {
  const body = await readJsonRequest(request, MAX_SIGN_IN_BYTES);
  if (!body.ok) return body.response;

  const secrets = readOwnerSecrets();
  if (!secrets) return errorResponse(askMessages.ownerNotConfigured, 503);

  const bucket = getClientAddress(request.headers).ip;
  if (failedAttempts.isLocked(bucket)) {
    return errorResponse(askMessages.ownerLocked, 429);
  }

  const passphrase = readPassphrase(body.value);
  if (passphrase === null) return errorResponse(askMessages.malformed, 400);

  if (!isPassphraseCorrect(passphrase, secrets.passphrase)) {
    failedAttempts.recordFailure(bucket);
    return errorResponse(askMessages.ownerWrong, 401);
  }

  failedAttempts.reset(bucket);
  const response = jsonResponse<OwnerSessionResponse>({ owner: true });
  setOwnerCookie(response, await signOwnerSession(secrets, Date.now()));
  return response;
}

/** Signs out by expiring the cookie. */
export function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const response = jsonResponse<OwnerSessionResponse>({ owner: false });
  clearOwnerCookie(response);
  return response;
}
