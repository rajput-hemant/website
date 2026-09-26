import "server-only";

import { askConfig } from "./config";

/**
 * Best-effort identity for anonymous visitors: a random id in a signed cookie,
 * with a salted IP hash as the fallback when the cookie is missing or forged.
 * Uses Web Crypto only, so it runs in Node and in tests without extra modules.
 */

export type AnonIdentity = {
  anonId: string;
  /** False when the id was just minted, so the IP hash should back it up. */
  fromCookie: boolean;
  /** Signed cookie value to send back; set only when the id is new. */
  cookieValue?: string;
};

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  let binary: string;
  try {
    binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function createAnonId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
}

/** HMAC-SHA256 of `message`, base64url. Shared by the visitor and owner cookies. */
export async function signMessage(
  message: string,
  secret: string
): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return toBase64Url(new Uint8Array(signature));
}

/** Constant-time check of a `signMessage` signature. */
export async function verifyMessageSignature(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return false;
  const key = await importHmacKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(message)
  );
}

/** `<id>.<HMAC-SHA256(id)>`, both base64url. */
export async function signAnonId(
  anonId: string,
  secret: string
): Promise<string> {
  return `${anonId}.${await signMessage(anonId, secret)}`;
}

/** Returns the id when the signature is valid, otherwise null. */
export async function verifyAnonCookie(
  cookieValue: string,
  secret: string
): Promise<string | null> {
  const [anonId, signature, ...rest] = cookieValue.split(".");
  if (!anonId || !signature || rest.length > 0) return null;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(anonId)) return null;
  return (await verifyMessageSignature(anonId, signature, secret))
    ? anonId
    : null;
}

export async function resolveAnonIdentity(
  cookieValue: string | undefined,
  secret: string
): Promise<AnonIdentity> {
  const verified = cookieValue
    ? await verifyAnonCookie(cookieValue, secret)
    : null;
  if (verified) return { anonId: verified, fromCookie: true };

  const anonId = createAnonId();
  return {
    anonId,
    fromCookie: false,
    cookieValue: await signAnonId(anonId, secret),
  };
}

/** Salted SHA-256 of the IP, hex, truncated so it identifies without exposing the address. */
export async function hashIp(
  ip: string,
  secret: string,
  length: number = askConfig.identity.ipHashLength
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`ip:${secret}:${ip}`)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  )
    .join("")
    .slice(0, length);
}
