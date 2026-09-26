import { parseSetCookie } from "cookie";
import { describe, expect, it } from "vitest";

import {
  nextUtcMidnight,
  readCookie,
  serializeSeenCookie,
  signSeenCookie,
  utcDay,
  verifySeenCookie,
} from "../seen-cookie";

const SECRET = "test-secret-with-enough-entropy";
const MORNING = Date.parse("2026-09-25T00:00:01.000Z");
const LATE = Date.parse("2026-09-25T23:59:59.999Z");
const NEXT_DAY = Date.parse("2026-09-26T00:00:00.000Z");

describe("utcDay and nextUtcMidnight", () => {
  it("uses the UTC calendar day", () => {
    expect(utcDay(MORNING)).toBe("2026-09-25");
    expect(utcDay(LATE)).toBe("2026-09-25");
    expect(utcDay(NEXT_DAY)).toBe("2026-09-26");
  });

  it("ends the day at the next UTC midnight, even exactly at midnight", () => {
    expect(nextUtcMidnight(MORNING).toISOString()).toBe(
      "2026-09-26T00:00:00.000Z"
    );
    expect(nextUtcMidnight(LATE).toISOString()).toBe(
      "2026-09-26T00:00:00.000Z"
    );
    expect(nextUtcMidnight(NEXT_DAY).toISOString()).toBe(
      "2026-09-27T00:00:00.000Z"
    );
  });
});

describe("signSeenCookie and verifySeenCookie", () => {
  it("verifies a cookie for the rest of the day it was signed", async () => {
    const value = await signSeenCookie(MORNING, SECRET);
    expect(value.startsWith("2026-09-25.")).toBe(true);
    await expect(verifySeenCookie(value, MORNING, SECRET)).resolves.toBe(true);
    await expect(verifySeenCookie(value, LATE, SECRET)).resolves.toBe(true);
  });

  it("stops verifying once the UTC day rolls over", async () => {
    const value = await signSeenCookie(LATE, SECRET);
    await expect(verifySeenCookie(value, NEXT_DAY, SECRET)).resolves.toBe(
      false
    );
  });

  it("rejects another secret, a forged day and malformed values", async () => {
    const value = await signSeenCookie(MORNING, SECRET);
    const signature = value.split(".")[1] ?? "";
    await expect(verifySeenCookie(value, MORNING, "other")).resolves.toBe(
      false
    );
    // Re-dating yesterday's cookie to today breaks the signature.
    const yesterday = await signSeenCookie(MORNING - 86_400_000, SECRET);
    const redated = `2026-09-25.${yesterday.split(".")[1] ?? ""}`;
    await expect(verifySeenCookie(redated, MORNING, SECRET)).resolves.toBe(
      false
    );
    for (const bad of [
      undefined,
      "",
      "2026-09-25",
      `2026-09-25.${signature}.extra`,
      `.${signature}`,
      "2026-09-25.not base64!",
    ]) {
      await expect(verifySeenCookie(bad, MORNING, SECRET)).resolves.toBe(false);
    }
  });
});

describe("serializeSeenCookie", () => {
  it("is httpOnly, site-wide and expires at the next UTC midnight", () => {
    expect(
      parseSetCookie(serializeSeenCookie("hr_seen", "v", MORNING, false))
    ).toEqual({
      name: "hr_seen",
      value: "v",
      path: "/",
      expires: new Date("2026-09-26T00:00:00.000Z"),
      httpOnly: true,
      sameSite: "lax",
    });
    expect(
      parseSetCookie(serializeSeenCookie("hr_seen", "v", MORNING, true)).secure
    ).toBe(true);
  });
});

describe("readCookie", () => {
  it("finds one cookie in a Cookie header", () => {
    const header = "hr_anon=abc; hr_seen=2026-09-25.sig; theme=dark";
    expect(readCookie(header, "hr_seen")).toBe("2026-09-25.sig");
    expect(readCookie(header, "missing")).toBeUndefined();
    expect(readCookie(null, "hr_seen")).toBeUndefined();
  });
});
