import { type NextRequest, type NextResponse } from "next/server";

import { askConfig } from "./config";
import { verifyOwnerSession, type OwnerSecrets } from "./owner";

/**
 * Server-only glue between the pure session in `owner.ts`, the environment
 * and the `hr_owner` cookie. Owner mode needs both `ASK_COOKIE_SECRET` and
 * `ASK_OWNER_PASSPHRASE`; without either, nobody is ever the owner.
 */
export function readOwnerSecrets(): OwnerSecrets | null {
  const cookieSecret = process.env.ASK_COOKIE_SECRET ?? "";
  const passphrase = process.env.ASK_OWNER_PASSPHRASE ?? "";
  return cookieSecret && passphrase ? { cookieSecret, passphrase } : null;
}

export async function isOwnerRequest(
  request: NextRequest,
  now: number = Date.now()
): Promise<boolean> {
  const secrets = readOwnerSecrets();
  if (!secrets) return false;
  const token = request.cookies.get(askConfig.owner.cookieName)?.value;
  return verifyOwnerSession(token, secrets, now);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
} as const;

export function setOwnerCookie(response: NextResponse, token: string): void {
  response.cookies.set(askConfig.owner.cookieName, token, {
    ...cookieOptions,
    maxAge: askConfig.owner.sessionMaxAgeSeconds,
  });
}

export function clearOwnerCookie(response: NextResponse): void {
  response.cookies.set(askConfig.owner.cookieName, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}
