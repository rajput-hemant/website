import { describe, expect, it } from "vitest";

import { askConfig } from "../config";
import {
  createAttemptLimiter,
  isPassphraseCorrect,
  signOwnerSession,
  verifyOwnerSession,
} from "../owner";

const secrets = {
  cookieSecret: "test-cookie-secret-that-is-long-enough",
  passphrase: "correct horse battery staple",
};
const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("owner session", () => {
  it("signs a token that verifies until it expires", async () => {
    const token = await signOwnerSession(secrets, NOW);
    expect(token).toMatch(/^\d+\.[A-Za-z0-9_-]+$/);
    expect(await verifyOwnerSession(token, secrets, NOW)).toBe(true);
    expect(await verifyOwnerSession(token, secrets, NOW + 29 * DAY_MS)).toBe(
      true
    );
  });

  it("expires after the configured lifetime", async () => {
    const token = await signOwnerSession(secrets, NOW);
    const expiry = NOW + askConfig.owner.sessionMaxAgeSeconds * 1000;
    expect(await verifyOwnerSession(token, secrets, expiry - 1000)).toBe(true);
    expect(await verifyOwnerSession(token, secrets, expiry)).toBe(false);
  });

  it("rejects a tampered expiry or signature", async () => {
    const token = await signOwnerSession(secrets, NOW);
    const [expiry = "", signature = ""] = token.split(".");
    const later = `${Number(expiry) + 60 * DAY_MS}.${signature}`;
    const flipped = `${expiry}.${signature.slice(0, -1)}${signature.endsWith("A") ? "B" : "A"}`;

    expect(await verifyOwnerSession(later, secrets, NOW)).toBe(false);
    expect(await verifyOwnerSession(flipped, secrets, NOW)).toBe(false);
  });

  it("rejects malformed values", async () => {
    for (const value of [undefined, "", "abc", "1.2.3", "x.y", `${NOW}.`]) {
      expect(await verifyOwnerSession(value, secrets, NOW)).toBe(false);
    }
  });

  it("is invalidated by a new cookie secret or passphrase", async () => {
    const token = await signOwnerSession(secrets, NOW);
    expect(
      await verifyOwnerSession(
        token,
        { ...secrets, cookieSecret: "another-secret" },
        NOW
      )
    ).toBe(false);
    expect(
      await verifyOwnerSession(
        token,
        { ...secrets, passphrase: "rotated passphrase" },
        NOW
      )
    ).toBe(false);
  });

  it("cannot be forged from a visitor cookie signature", async () => {
    const { signAnonId } = await import("../identity");
    const expiry = Math.floor(NOW / 1000) + 3600;
    const anon = await signAnonId(String(expiry), secrets.cookieSecret);
    expect(await verifyOwnerSession(anon, secrets, NOW)).toBe(false);
  });
});

describe("isPassphraseCorrect", () => {
  it("accepts only the exact passphrase", () => {
    expect(isPassphraseCorrect(secrets.passphrase, secrets.passphrase)).toBe(
      true
    );
    expect(isPassphraseCorrect("correct horse", secrets.passphrase)).toBe(
      false
    );
    expect(
      isPassphraseCorrect(`${secrets.passphrase} `, secrets.passphrase)
    ).toBe(false);
    expect(isPassphraseCorrect("", secrets.passphrase)).toBe(false);
  });

  it("never matches when no passphrase is configured", () => {
    expect(isPassphraseCorrect("", "")).toBe(false);
  });
});

describe("createAttemptLimiter", () => {
  function limiter() {
    let now = NOW;
    const instance = createAttemptLimiter({
      maxFailures: 5,
      windowMs: 15 * 60 * 1000,
      now: () => now,
    });
    return {
      instance,
      advance: (ms: number) => {
        now += ms;
      },
    };
  }

  it("locks a bucket after five failures in the window", () => {
    const { instance } = limiter();
    for (let i = 0; i < 4; i++) instance.recordFailure("direct");
    expect(instance.isLocked("direct")).toBe(false);
    instance.recordFailure("direct");
    expect(instance.isLocked("direct")).toBe(true);
    expect(instance.isLocked("203.0.113.9")).toBe(false);
  });

  it("unlocks as failures age out of the window", () => {
    const { instance, advance } = limiter();
    instance.recordFailure("direct");
    advance(10 * 60 * 1000);
    for (let i = 0; i < 4; i++) instance.recordFailure("direct");
    expect(instance.isLocked("direct")).toBe(true);
    advance(5 * 60 * 1000 + 1);
    expect(instance.isLocked("direct")).toBe(false);
  });

  it("forgets a bucket on reset", () => {
    const { instance } = limiter();
    for (let i = 0; i < 5; i++) instance.recordFailure("direct");
    instance.reset("direct");
    expect(instance.isLocked("direct")).toBe(false);
  });

  it("uses the configured defaults", () => {
    expect(askConfig.owner.maxFailedAttempts).toBe(5);
    expect(askConfig.owner.failedAttemptWindowMs).toBe(15 * 60 * 1000);
  });
});
