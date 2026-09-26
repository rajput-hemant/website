import { createHash, timingSafeEqual } from "node:crypto";

import { askConfig } from "./config";
import { signMessage, verifyMessageSignature } from "./identity";

/**
 * The owner's on-site session: a passphrase exchanged for an HMAC-signed,
 * expiring cookie. Pure apart from the clock, which callers pass in.
 */

export type OwnerSecrets = {
  /** `ASK_COOKIE_SECRET`: the HMAC key. */
  cookieSecret: string;
  /** `ASK_OWNER_PASSPHRASE`: bound into every token, so changing it signs every device out. */
  passphrase: string;
};

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function sessionMessage(expiresAt: number, passphrase: string): string {
  const fingerprint = sha256(`owner:${passphrase}`)
    .toString("hex")
    .slice(0, 16);
  return `hr_owner:v1:${expiresAt}:${fingerprint}`;
}

/** `<expiry in unix seconds>.<signature>`. */
export async function signOwnerSession(
  secrets: OwnerSecrets,
  nowMs: number,
  maxAgeSeconds: number = askConfig.owner.sessionMaxAgeSeconds
): Promise<string> {
  const expiresAt = Math.floor(nowMs / 1000) + maxAgeSeconds;
  const signature = await signMessage(
    sessionMessage(expiresAt, secrets.passphrase),
    secrets.cookieSecret
  );
  return `${expiresAt}.${signature}`;
}

export async function verifyOwnerSession(
  token: string | undefined,
  secrets: OwnerSecrets,
  nowMs: number
): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature, ...rest] = token.split(".");
  if (!expiry || !signature || rest.length > 0 || !/^\d{1,12}$/.test(expiry)) {
    return false;
  }
  const expiresAt = Number(expiry);
  if (expiresAt * 1000 <= nowMs) return false;
  return verifyMessageSignature(
    sessionMessage(expiresAt, secrets.passphrase),
    signature,
    secrets.cookieSecret
  );
}

/**
 * Compares SHA-256 digests with `timingSafeEqual`: equal-length buffers
 * whatever the input, so neither the content nor the length leaks through timing.
 */
export function isPassphraseCorrect(input: string, expected: string): boolean {
  if (expected === "") return false;
  return timingSafeEqual(sha256(input), sha256(expected));
}

/** Past this many buckets, expired ones are swept before tracking another. */
const MAX_TRACKED_BUCKETS = 1_000;

export type AttemptLimiter = {
  isLocked(bucket: string): boolean;
  recordFailure(bucket: string): void;
  reset(bucket: string): void;
};

/**
 * Failed sign-ins per bucket in a sliding window, held in memory: one
 * self-hosted process, and a restart only forgives a few guesses.
 */
export function createAttemptLimiter({
  maxFailures = askConfig.owner.maxFailedAttempts,
  windowMs = askConfig.owner.failedAttemptWindowMs,
  now = Date.now,
}: {
  maxFailures?: number;
  windowMs?: number;
  now?: () => number;
} = {}): AttemptLimiter {
  const failures = new Map<string, number[]>();

  function recent(bucket: string): number[] {
    const cutoff = now() - windowMs;
    const kept = (failures.get(bucket) ?? []).filter((at) => at > cutoff);
    if (kept.length > 0) failures.set(bucket, kept);
    else failures.delete(bucket);
    return kept;
  }

  return {
    isLocked: (bucket) => recent(bucket).length >= maxFailures,
    recordFailure(bucket) {
      if (failures.size >= MAX_TRACKED_BUCKETS) {
        for (const key of [...failures.keys()]) recent(key);
      }
      failures.set(bucket, [...recent(bucket), now()]);
    },
    reset(bucket) {
      failures.delete(bucket);
    },
  };
}
