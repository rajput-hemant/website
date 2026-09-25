import { describe, expect, it, vi } from "vitest";

import { askConfig } from "../config";
import { type AnonIdentity } from "../identity";
import {
  type IdentityLimit,
  type IdentityLookup,
  type NewQuestion,
  type QuestionStore,
} from "../store";
import { submit, type Requester, type SubmitDeps } from "../submit";

const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const body = "What made you move from backend work into platform engineering?";

function payload(overrides: Record<string, unknown> = {}) {
  return { body, t: NOW - 20_000, ...overrides };
}

function requester(identity: Partial<AnonIdentity> = {}): Requester {
  return {
    identity: { anonId: "anon-123", fromCookie: true, ...identity },
    ipHash: "abcdef123456",
    userAgent: "vitest",
  };
}

function fakeStore(
  options: { pending?: number; limit?: IdentityLimit; duplicate?: boolean } = {}
) {
  const created: NewQuestion[] = [];
  const lookups: IdentityLookup[] = [];
  const store: QuestionStore = {
    countPending: vi.fn(async () => options.pending ?? 0),
    findIdentityLimit: vi.fn(async (lookup: IdentityLookup) => {
      lookups.push(lookup);
      return options.limit ?? null;
    }),
    hasPendingDuplicate: vi.fn(async () => options.duplicate ?? false),
    createQuestion: vi.fn(async (question: NewQuestion) => {
      created.push(question);
    }),
  };
  return { store, created, lookups };
}

function deps(store: QuestionStore | null): SubmitDeps {
  return {
    store,
    getPendingCount: () => store?.countPending() ?? Promise.resolve(0),
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
    expect(store.countPending).not.toHaveBeenCalled();
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
      { payload: payload({ t: NOW - 500 }), requester: requester() },
      deps(store)
    );
    const stale = await submit(
      {
        payload: payload({ t: NOW - 7 * 60 * 60 * 1000 }),
        requester: requester(),
      },
      deps(store)
    );

    expect(fast).toMatchObject({ kind: "discarded", reason: "too-fast" });
    expect(stale).toEqual({ kind: "expired" });
    expect(store.countPending).not.toHaveBeenCalled();
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
      pending: askConfig.circuitBreaker.pendingCap,
    });
    const result = await submit(
      { payload: payload(), requester: requester() },
      deps(store)
    );

    expect(result).toEqual({ kind: "unavailable", reason: "circuit-open" });
    expect(store.findIdentityLimit).not.toHaveBeenCalled();
  });

  it("accepts one below the pending cap", async () => {
    const { store } = fakeStore({
      pending: askConfig.circuitBreaker.pendingCap - 1,
    });
    const result = await submit(
      { payload: payload(), requester: requester() },
      deps(store)
    );
    expect(result.kind).toBe("accepted");
  });

  it.each(["open-thread", "cooldown"] as const)(
    "rate-limits an identity with a %s",
    async (limit) => {
      const { store } = fakeStore({ limit });
      const result = await submit(
        { payload: payload(), requester: requester() },
        deps(store)
      );

      expect(result).toEqual({ kind: "rate-limited", reason: limit });
      expect(store.hasPendingDuplicate).not.toHaveBeenCalled();
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
      openSince: "2026-09-18T12:00:00.000Z",
      cooldownSince: "2026-09-24T12:00:00.000Z",
    });

    const fresh = fakeStore();
    await submit(
      { payload: payload(), requester: requester({ fromCookie: false }) },
      deps(fresh.store)
    );
    expect(fresh.lookups[0]?.ipHash).toBe("abcdef123456");
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
