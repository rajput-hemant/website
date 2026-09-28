import "server-only";

import type { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";

import { askConfig } from "./config";
import { verifyOwnerSession, type OwnerSecrets } from "./owner";

/**
 * Server-only glue between the pure session in `owner.ts`, the environment
 * and the `hr_owner` cookie. Owner mode needs both `ASK_COOKIE_SECRET` and
 * `ASK_OWNER_PASSPHRASE`; without either, nobody is ever the owner.
 */
export function readOwnerSecrets(): OwnerSecrets | null {
  const cookieSecret = serverEnv.ASK_COOKIE_SECRET ?? "";
  const passphrase = serverEnv.ASK_OWNER_PASSPHRASE ?? "";
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
  secure: serverEnv.NODE_ENV === "production",
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
