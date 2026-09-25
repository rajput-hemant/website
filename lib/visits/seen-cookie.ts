import { signMessage, verifyMessageSignature } from "@/lib/ask/identity";

/**
 * The daily "already counted" marker: `<YYYY-MM-DD>.<HMAC>` for the current
 * UTC day. It carries no identifier, only the day, so it counts a browser once
 * per day without tracking it across days. The day is inside the signature, so
 * a kept or copied cookie stops counting as seen once the day rolls over.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Namespaced so a signature minted for another cookie can never verify here. */
const message = (day: string) => `hr_seen:${day}`;

export function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function nextUtcMidnight(now: number): Date {
  return new Date(Math.floor(now / DAY_MS) * DAY_MS + DAY_MS);
}

export async function signSeenCookie(
  now: number,
  secret: string
): Promise<string> {
  const day = utcDay(now);
  return `${day}.${await signMessage(message(day), secret)}`;
}

/** True only for a valid signature over today's UTC day. */
export async function verifySeenCookie(
  value: string | undefined,
  now: number,
  secret: string
): Promise<boolean> {
  if (!value) return false;
  const [day, signature, ...rest] = value.split(".");
  if (!day || !signature || rest.length > 0) return false;
  if (day !== utcDay(now)) return false;
  return verifyMessageSignature(message(day), signature, secret);
}

/** A `Set-Cookie` value that expires when the UTC day does. */
export function serializeSeenCookie(
  name: string,
  value: string,
  now: number,
  secure: boolean
): string {
  const attributes = [
    `${name}=${value}`,
    "Path=/",
    `Expires=${nextUtcMidnight(now).toUTCString()}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

/** Reads one cookie from a raw `Cookie` header. */
export function readCookie(
  header: string | null,
  name: string
): string | undefined {
  if (!header) return undefined;
  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim();
    }
  }
  return undefined;
}
