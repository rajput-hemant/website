import { describe, expect, it, vi } from "vitest";

import {
  handleVisitGet,
  handleVisitPost,
  publicReadCacheControl,
  type VisitDeps,
} from "../handler";
import { createRateLimiter } from "../rate-limit";
import { signSeenCookie } from "../seen-cookie";
import { type VisitStore } from "../store";

const SECRET = "test-secret-with-enough-entropy";
const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const chrome =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function fakeStore(initial = 41) {
  let visitors = initial;
  return {
    read: vi.fn<VisitStore["read"]>(async () => visitors),
    increment: vi.fn<VisitStore["increment"]>(async () => ++visitors),
  };
}

function deps(overrides: Partial<VisitDeps> = {}): VisitDeps {
  return {
    store: fakeStore(),
    secret: SECRET,
    limiter: createRateLimiter({ windowMs: 60_000, maxKeys: 100 }),
    now: () => NOW,
    secureCookies: false,
    clientAddress: () => ({ ip: "203.0.113.9", trusted: true }),
    ...overrides,
  };
}

function visit(
  init: { headers?: Record<string, string>; body?: string } = {}
): Request {
  return new Request("http://localhost/api/visits", {
    method: "POST",
    headers: {
      "user-agent": chrome,
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "content-type": "application/json",
      ...init.headers,
    },
    body: init.body ?? "{}",
  });
}

describe("POST /api/visits", () => {
  it("counts a first visit and sets the daily cookie", async () => {
    const store = fakeStore(41);
    const response = await handleVisitPost(visit(), deps({ store }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ visitors: 42 });
    expect(store.increment).toHaveBeenCalledWith("2026-09-25T12:00:00.000Z");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^hr_seen=2026-09-25\.[\w-]+; Path=\/; /);
    expect(cookie).toContain("Expires=Sat, 26 Sep 2026 00:00:00 GMT");
    expect(cookie).toContain("HttpOnly");
  });

  it("does not count a return visit on the same day", async () => {
    const store = fakeStore(42);
    const seen = await signSeenCookie(NOW - 3_600_000, SECRET);
    const response = await handleVisitPost(
      visit({ headers: { cookie: `theme=dark; hr_seen=${seen}` } }),
      deps({ store })
    );

    await expect(response.json()).resolves.toEqual({ visitors: 42 });
    expect(store.increment).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("counts again with yesterday's or a forged cookie", async () => {
    const store = fakeStore(42);
    const yesterday = await signSeenCookie(NOW - 86_400_000, SECRET);
    for (const cookie of [
      `hr_seen=${yesterday}`,
      "hr_seen=2026-09-25.forged",
    ]) {
      await handleVisitPost(visit({ headers: { cookie } }), deps({ store }));
    }
    expect(store.increment).toHaveBeenCalledTimes(2);
  });

  it("accepts an empty body without a content type", async () => {
    const store = fakeStore();
    const request = new Request("http://localhost/api/visits", {
      method: "POST",
      headers: { "user-agent": chrome, "sec-fetch-site": "same-origin" },
    });
    const response = await handleVisitPost(request, deps({ store }));
    expect(response.status).toBe(200);
    expect(store.increment).toHaveBeenCalledOnce();
  });

  it("reads without counting for bots", async () => {
    const store = fakeStore(42);
    const crawler = await handleVisitPost(
      visit({ headers: { "user-agent": "Googlebot/2.1" } }),
      deps({ store })
    );
    const noMetadata = await handleVisitPost(
      new Request("http://localhost/api/visits", {
        method: "POST",
        headers: { "user-agent": chrome },
      }),
      deps({ store })
    );

    await expect(crawler.json()).resolves.toEqual({ visitors: 42 });
    await expect(noMetadata.json()).resolves.toEqual({ visitors: 42 });
    expect(store.increment).not.toHaveBeenCalled();
  });

  it("answers 503 without Sanity or without the cookie secret", async () => {
    for (const missing of [{ store: null }, { secret: undefined }]) {
      const response = await handleVisitPost(visit(), deps(missing));
      expect(response.status).toBe(503);
    }
  });

  it("refuses cross-site requests and bad bodies before touching the store", async () => {
    const store = fakeStore();
    const cases: [Request, number][] = [
      [visit({ headers: { "sec-fetch-site": "cross-site" } }), 403],
      [visit({ headers: { "content-type": "text/plain" } }), 415],
      [visit({ body: "{" }), 400],
      [visit({ body: JSON.stringify({ pad: "x".repeat(512) }) }), 413],
    ];
    for (const [request, status] of cases) {
      const response = await handleVisitPost(request, deps({ store }));
      expect(response.status).toBe(status);
    }
    expect(store.read).not.toHaveBeenCalled();
    expect(store.increment).not.toHaveBeenCalled();
  });

  it("rate limits one address", async () => {
    const shared = deps();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await handleVisitPost(visit(), shared)).status);
    }
    expect(statuses.slice(0, 10).every((status) => status === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });

  it("answers 503 when Sanity fails", async () => {
    const store = fakeStore();
    store.increment.mockRejectedValueOnce(new Error("down"));
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    const response = await handleVisitPost(visit(), deps({ store }));
    expect(response.status).toBe(503);
  });
});

describe("GET /api/visits", () => {
  it("returns the count with a shared-cache header", async () => {
    const response = await handleVisitGet(deps({ store: fakeStore(12_408) }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ visitors: 12_408 });
    expect(response.headers.get("cache-control")).toBe(publicReadCacheControl);
  });

  it("answers an uncached 503 without Sanity", async () => {
    const response = await handleVisitGet(deps({ store: null }));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
