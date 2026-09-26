import { describe, expect, it } from "vitest";

import {
  createAnonId,
  hashIp,
  resolveAnonIdentity,
  signAnonId,
  verifyAnonCookie,
} from "../identity";

const secret = "test-secret-with-enough-entropy";

describe("anonymous cookie", () => {
  it("round-trips a signed id", async () => {
    const anonId = createAnonId();
    const cookie = await signAnonId(anonId, secret);
    expect(await verifyAnonCookie(cookie, secret)).toBe(anonId);
  });

  it("rejects a tampered id or signature", async () => {
    const cookie = await signAnonId(createAnonId(), secret);
    const [id = "", signature = ""] = cookie.split(".");
    const flip = (value: string) =>
      (value[0] === "A" ? "B" : "A") + value.slice(1);

    expect(
      await verifyAnonCookie(`${flip(id)}.${signature}`, secret)
    ).toBeNull();
    expect(
      await verifyAnonCookie(`${id}.${flip(signature)}`, secret)
    ).toBeNull();
    expect(
      await verifyAnonCookie(`${id}.${signature}.extra`, secret)
    ).toBeNull();
    expect(await verifyAnonCookie(id, secret)).toBeNull();
  });

  it("rejects a cookie signed with another secret", async () => {
    const cookie = await signAnonId(createAnonId(), "another-secret");
    expect(await verifyAnonCookie(cookie, secret)).toBeNull();
  });

  it("reuses a valid cookie and mints a new one otherwise", async () => {
    const cookie = await signAnonId(createAnonId(), secret);
    const existing = await resolveAnonIdentity(cookie, secret);
    expect(existing).toEqual({
      anonId: cookie.split(".")[0],
      fromCookie: true,
    });

    const fresh = await resolveAnonIdentity("forged.value", secret);
    expect(fresh.fromCookie).toBe(false);
    expect(fresh.cookieValue).toBeDefined();
    expect(await verifyAnonCookie(fresh.cookieValue ?? "", secret)).toBe(
      fresh.anonId
    );
  });
});

describe("hashIp", () => {
  it("is a stable, salted, 12-character hex string", async () => {
    const hash = await hashIp("203.0.113.7", secret);
    expect(hash).toMatch(/^[0-9a-f]{12}$/);
    expect(await hashIp("203.0.113.7", secret)).toBe(hash);
    expect(await hashIp("203.0.113.7", "other-salt")).not.toBe(hash);
    expect(await hashIp("203.0.113.8", secret)).not.toBe(hash);
  });
});
