import { describe, expect, it, vi } from "vitest";

import { askConfig } from "../config";
import { type AnonIdentity } from "../identity";
import { type IdentityLimit } from "../limits";
import {
  type IdentityActivity,
  type IdentityLookup,
  type NewQuestion,
  type QuestionStore,
} from "../store";
import { submit, type Requester, type SubmitDeps } from "../submit";

const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const body = "What made you move from backend work into platform engineering?";

function payload(overrides: Record<string, unknown> = {}) {
  return { body, elapsed: 20_000, ...overrides };
}

function requester(
  identity: Partial<AnonIdentity> = {},
  ipTrusted = true
): Requester {
  return {
    identity: { anonId: "anon-123", fromCookie: true, ...identity },
    ipHash: "abcdef123456",
    ipTrusted,
    userAgent: "vitest",
  };
}

const activityFor: Record<IdentityLimit, Partial<IdentityActivity>> = {
  "open-thread": { open: 1 },
  cooldown: { cooldown: 1 },
  "daily-cap": { today: askConfig.limits.dailyPerIp },
};

function fakeStore(
  options: {
    awaiting?: number;
    activity?: Partial<IdentityActivity>;
    duplicate?: boolean;
  } = {}
) {
  const created: NewQuestion[] = [];
  const lookups: IdentityLookup[] = [];
  const store: QuestionStore = {
    countAwaitingReview: vi.fn(async () => options.awaiting ?? 0),
    countIdentityActivity: vi.fn(async (lookup: IdentityLookup) => {
      lookups.push(lookup);
      return { open: 0, cooldown: 0, today: 0, ...options.activity };
    }),
    hasUnreviewedDuplicate: vi.fn(async () => options.duplicate ?? false),
    createQuestion: vi.fn(async (question: NewQuestion) => {
      created.push(question);
    }),
  };
  return { store, created, lookups };
}

function deps(store: QuestionStore | null): SubmitDeps {
  return {
    store,
    getPendingCount: () => store?.countAwaitingReview("") ?? Promise.resolve(0),
    now: () => NOW,
    createSlug: () => "Slug1234",
  };
}

describe("submit", () => {
  it("writes a clean submission as pending", async () => {
    const { store, created } = fakeStore();
    const result = await submit(
      {
        payload: payload({ name: " Ada ", email: "ada@example.com" }),
        requester: requester(),
      },
      deps(store)
    );

    expect(result).toEqual({
      kind: "accepted",
      slug: "Slug1234",
      status: "pending",
    });
    expect(created).toEqual([
      {
        body,
        author: { name: "Ada", email: "ada@example.com", anonId: "anon-123" },
        status: "pending",
        slug: "Slug1234",
        submittedAt: "2026-09-25T12:00:00.000Z",
        moderation: {
          score: 0,
          reasons: [],
          ipHash: "abcdef123456",
          ua: "vitest",
          elapsedMs: 20_000,
        },
      },
    ]);
  });

  it("writes a three-link submission as spam", async () => {
    const { store, created } = fakeStore();
    const result = await submit(
      {
        payload: payload({
          body: "deals https://a.io https://b.io https://c.io",
        }),
        requester: requester(),
      },
      deps(store)
    );

    expect(result).toMatchObject({ kind: "accepted", status: "spam" });
    expect(created[0]?.moderation.reasons).toEqual(["links:3"]);
  });

  it("returns field errors without touching the store", async () => {
    const { store } = fakeStore();
    const result = await submit(
      { payload: payload({ body: "short" }), requester: requester() },
      deps(store)
    );

    expect(result.kind).toBe("invalid");
    expect(store.countAwaitingReview).not.toHaveBeenCalled();
  });

  it("silently discards a filled honeypot, even without Sanity", async () => {
    const result = await submit(
      {
        payload: payload({ website: "https://spam.example" }),
        requester: null,
      },
      deps(null)
    );
    expect(result).toEqual({
      kind: "discarded",
      slug: "Slug1234",
      reason: "honeypot",
    });
  });

  it("discards submissions that arrive too fast and expires stale forms", async () => {
    const { store } = fakeStore();
    const fast = await submit(
      { payload: payload({ elapsed: 500 }), requester: requester() },
      deps(store)
    );
    const stale = await submit(
      {
        payload: payload({ elapsed: 7 * 60 * 60 * 1000 }),
        requester: requester(),
      },
      deps(store)
    );

    expect(fast).toMatchObject({ kind: "discarded", reason: "too-fast" });
    expect(stale).toEqual({ kind: "expired" });
    expect(store.countAwaitingReview).not.toHaveBeenCalled();
  });

  it("reports an unconfigured inbox after the cheap checks", async () => {
    expect(
      await submit({ payload: payload(), requester: requester() }, deps(null))
    ).toEqual({ kind: "unavailable", reason: "not-configured" });
    const { store } = fakeStore();
    expect(
      await submit({ payload: payload(), requester: null }, deps(store))
    ).toEqual({
      kind: "unavailable",
      reason: "not-configured",
    });
  });

  it("closes at the pending cap before any per-identity query", async () => {
    const { store } = fakeStore({
      awaiting: askConfig.circuitBreaker.pendingCap,
    });
    const result = await submit(
      { payload: payload(), requester: requester() },
      deps(store)
    );

    expect(result).toEqual({ kind: "unavailable", reason: "circuit-open" });
    expect(store.countIdentityActivity).not.toHaveBeenCalled();
  });

  it("accepts one below the pending cap", async () => {
    const { store } = fakeStore({
      awaiting: askConfig.circuitBreaker.pendingCap - 1,
    });
    const result = await submit(
      { payload: payload(), requester: requester() },
      deps(store)
    );
    expect(result.kind).toBe("accepted");
  });

  it.each(["open-thread", "cooldown", "daily-cap"] as const)(
    "rate-limits an identity with a %s",
    async (limit) => {
      const { store } = fakeStore({ activity: activityFor[limit] });
      const result = await submit(
        { payload: payload(), requester: requester() },
        deps(store)
      );

      expect(result).toEqual({ kind: "rate-limited", reason: limit });
      expect(store.hasUnreviewedDuplicate).not.toHaveBeenCalled();
    }
  );

  it("looks up by IP hash only when the cookie was just minted", async () => {
    const withCookie = fakeStore();
    await submit(
      { payload: payload(), requester: requester() },
      deps(withCookie.store)
    );
    expect(withCookie.lookups[0]).toEqual({
      anonId: "anon-123",
      ipHash: null,
      networkHash: "abcdef123456",
      openSince: "2026-09-18T12:00:00.000Z",
      cooldownSince: "2026-09-24T12:00:00.000Z",
      dailySince: "2026-09-24T12:00:00.000Z",
    });

    const fresh = fakeStore();
    await submit(
      { payload: payload(), requester: requester({ fromCookie: false }) },
      deps(fresh.store)
    );
    expect(fresh.lookups[0]?.ipHash).toBe("abcdef123456");
  });

  it("never matches threads on the shared bucket when no proxy is trusted", async () => {
    const { store, lookups } = fakeStore();
    await submit(
      {
        payload: payload(),
        requester: requester({ fromCookie: false }, false),
      },
      deps(store)
    );
    expect(lookups[0]).toMatchObject({
      ipHash: null,
      networkHash: "abcdef123456",
    });
  });

  it("applies the daily cap even with a valid cookie", async () => {
    const { store, created } = fakeStore({
      activity: { today: askConfig.limits.dailyPerIp },
    });
    const result = await submit(
      { payload: payload(), requester: requester({ fromCookie: true }) },
      deps(store)
    );
    expect(result).toEqual({ kind: "rate-limited", reason: "daily-cap" });
    expect(created).toHaveLength(0);
  });

  it("uses the larger global cap for the shared bucket", async () => {
    const belowGlobal = fakeStore({
      activity: { today: askConfig.limits.dailyWithoutTrustedProxy - 1 },
    });
    expect(
      await submit(
        { payload: payload(), requester: requester({}, false) },
        deps(belowGlobal.store)
      )
    ).toMatchObject({ kind: "accepted" });

    const atGlobal = fakeStore({
      activity: { today: askConfig.limits.dailyWithoutTrustedProxy },
    });
    expect(
      await submit(
        { payload: payload(), requester: requester({}, false) },
        deps(atGlobal.store)
      )
    ).toEqual({ kind: "rate-limited", reason: "daily-cap" });
  });

  it("answers a pending duplicate as accepted but writes nothing", async () => {
    const { store, created } = fakeStore({ duplicate: true });
    const result = await submit(
      { payload: payload(), requester: requester() },
      deps(store)
    );

    expect(result).toEqual({
      kind: "discarded",
      slug: "Slug1234",
      reason: "duplicate",
    });
    expect(created).toHaveLength(0);
  });

  it("propagates store failures", async () => {
    const { store } = fakeStore();
    vi.mocked(store.createQuestion).mockRejectedValueOnce(new Error("down"));
    await expect(
      submit({ payload: payload(), requester: requester() }, deps(store))
    ).rejects.toThrow("down");
  });
});
