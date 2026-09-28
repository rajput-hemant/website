import { describe, expect, it } from "vitest";

import {
  getClientAddress,
  hasJsonContentType,
  isCrossSiteRequest,
  readTrustedProxyHops,
  UNKNOWN_CLIENT,
} from "../http";

const headers = (init: Record<string, string>) => new Headers(init);

describe("readTrustedProxyHops", () => {
  it("defaults to no trusted proxy", () => {
    expect(readTrustedProxyHops(undefined)).toBe(0);
    expect(readTrustedProxyHops("")).toBe(0);
    expect(readTrustedProxyHops("0")).toBe(0);
    expect(readTrustedProxyHops("yes")).toBe(0);
    expect(readTrustedProxyHops("-1")).toBe(0);
  });

  it("reads a positive hop count", () => {
    expect(readTrustedProxyHops("1")).toBe(1);
    expect(readTrustedProxyHops("2")).toBe(2);
  });
});

describe("getClientAddress", () => {
  const forged = headers({
    "x-forwarded-for": "6.6.6.6, 203.0.113.9",
    "x-real-ip": "6.6.6.6",
  });

  it("ignores forwarding headers without a trusted proxy", () => {
    expect(getClientAddress(forged, 0)).toEqual({
      ip: UNKNOWN_CLIENT,
      trusted: false,
    });
  });

  it("takes the entry the trusted proxy appended, not the client-supplied ones", () => {
    expect(getClientAddress(forged, 1)).toEqual({
      ip: "203.0.113.9",
      trusted: true,
    });
    expect(getClientAddress(forged, 2)).toEqual({
      ip: "6.6.6.6",
      trusted: true,
    });
  });

  it("falls back to the shared bucket when the chain is too short", () => {
    expect(getClientAddress(headers({}), 1)).toEqual({
      ip: UNKNOWN_CLIENT,
      trusted: false,
    });
    expect(
      getClientAddress(headers({ "x-forwarded-for": "203.0.113.9" }), 2)
    ).toEqual({ ip: UNKNOWN_CLIENT, trusted: false });
  });
});

describe("hasJsonContentType", () => {
  it("accepts application/json with parameters, in any case", () => {
    expect(
      hasJsonContentType(headers({ "content-type": "application/json" }))
    ).toBe(true);
    expect(
      hasJsonContentType(
        headers({ "content-type": "Application/JSON; charset=utf-8" })
      )
    ).toBe(true);
  });

  it("rejects the content types a cross-site form can send", () => {
    for (const type of [
      "text/plain",
      "application/x-www-form-urlencoded",
      "multipart/form-data; boundary=x",
    ]) {
      expect(hasJsonContentType(headers({ "content-type": type }))).toBe(false);
    }
    expect(hasJsonContentType(headers({}))).toBe(false);
  });
});

describe("isCrossSiteRequest", () => {
  it("allows same-origin, user-initiated and header-less requests", () => {
    expect(
      isCrossSiteRequest(headers({ "sec-fetch-site": "same-origin" }))
    ).toBe(false);
    expect(isCrossSiteRequest(headers({ "sec-fetch-site": "none" }))).toBe(
      false
    );
    expect(isCrossSiteRequest(headers({}))).toBe(false);
  });

  it("refuses same-site and cross-site requests", () => {
    expect(
      isCrossSiteRequest(headers({ "sec-fetch-site": "cross-site" }))
    ).toBe(true);
    expect(isCrossSiteRequest(headers({ "sec-fetch-site": "same-site" }))).toBe(
      true
    );
  });
});
