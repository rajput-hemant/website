import { describe, expect, it, vi } from "vitest";

import { askConfig } from "../config";
import { type AnonIdentity } from "../identity";
import { type IdentityLimit } from "../limits";
import {
  type IdentityActivity,
  type IdentityLookup,
  type NewQuestion,
  type NewReply,
  type QuestionStore,
  type ThreadRef,
} from "../store";
import {
  submit,
  type Requester,
  type SubmitDeps,
  type SubmitTarget,
} from "../submit";

const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const AT = "2026-09-25T12:00:00.000Z";
const body = "What made you move from backend work into platform engineering?";
const THREAD: SubmitTarget = { kind: "thread" };
const REPLY: SubmitTarget = { kind: "reply", slug: "Thread12" };

function payload(overrides: Record<string, unknown> = {}) {
  return { body, elapsed: 20_000, ...overrides };
}

function requester(
  identity: Partial<AnonIdentity> = {},
  ipTrusted = true,
  owner = false
): Requester {
  return {
    identity: { anonId: "anon-123", fromCookie: true, ...identity },
    ipHash: "abcdef123456",
    ipTrusted,
    userAgent: "vitest",
    owner,
  };
}

const owner = () => requester({}, true, true);

const quiet: IdentityActivity = {
  pendingThreads: 0,
  pendingReplies: 0,
  repliesToday: 0,
  today: 0,
};

function fakeStore(
  options: {
    awaiting?: number;
    activity?: Partial<IdentityActivity>;
    duplicate?: boolean;
    thread?: ThreadRef | null;
  } = {}
) {
  const created: NewQuestion[] = [];
  const appended: { threadId: string; reply: NewReply; at?: string }[] = [];
  const lookups: IdentityLookup[] = [];
  const store: QuestionStore = {
    countAwaitingReview: vi.fn(async () => options.awaiting ?? 0),
    countIdentityActivity: vi.fn(async (lookup: IdentityLookup) => {
      lookups.push(lookup);
      return { ...quiet, ...options.activity };
    }),
    hasUnreviewedDuplicate: vi.fn(async () => options.duplicate ?? false),
    findThread: vi.fn(async () =>
      options.thread === undefined
        ? { id: "question-1", status: "published" as const }
        : options.thread
    ),
    createQuestion: vi.fn(async (question: NewQuestion) => {
      created.push(question);
    }),
    appendReply: vi.fn(
      async (threadId: string, reply: NewReply, at?: string) => {
        appended.push({ threadId, reply, at });
      }
    ),
  };
  return { store, created, appended, lookups };
}

function deps(store: QuestionStore | null): SubmitDeps {
  return {
    store,
    getPendingCount: () => store?.countAwaitingReview("") ?? Promise.resolve(0),
    now: () => NOW,
    createSlug: () => "Slug1234",
    createKey: () => "key-1",
  };
}

const moderation = {
  score: 0,
  reasons: [],
  ipHash: "abcdef123456",
  ua: "vitest",
  elapsedMs: 20_000,
};

describe("submit: threads", () => {
  it("writes a clean visitor thread as pending", async () => {
    const { store, created } = fakeStore();
    const result = await submit(
      {
        target: THREAD,
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
        by: "visitor",
        body,
        author: { name: "Ada", anonId: "anon-123" },
        status: "pending",
        slug: "Slug1234",
        submittedAt: AT,
        publishedAt: undefined,
        lastActivityAt: undefined,
        moderation,
      },
    ]);
  });

  it("writes a three-link submission as spam", async () => {
    const { store, created } = fakeStore();
    const result = await submit(
      {
        target: THREAD,
        payload: payload({
          body: "deals https://a.io https://b.io https://c.io",
        }),
        requester: requester(),
      },
      deps(store)
    );

    expect(result).toMatchObject({ kind: "accepted", status: "spam" });
    expect(created[0]?.moderation?.reasons).toEqual(["links:3"]);
  });

  it("returns field errors without touching the store", async () => {
    const { store } = fakeStore();
    const result = await submit(
      {
        target: THREAD,
        payload: payload({ body: "short" }),
        requester: requester(),
      },
      deps(store)
    );

    expect(result.kind).toBe("invalid");
    expect(store.countAwaitingReview).not.toHaveBeenCalled();
  });

  it("silently discards a filled honeypot, even without Sanity", async () => {
    const result = await submit(
      {
        target: THREAD,
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
      {
        target: THREAD,
        payload: payload({ elapsed: 500 }),
        requester: requester(),
      },
      deps(store)
    );
    const stale = await submit(
      {
        target: THREAD,
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
      await submit(
        { target: THREAD, payload: payload(), requester: requester() },
        deps(null)
      )
    ).toEqual({ kind: "unavailable", reason: "not-configured" });
    const { store } = fakeStore();
    expect(
      await submit(
        { target: THREAD, payload: payload(), requester: null },
        deps(store)
      )
    ).toEqual({ kind: "unavailable", reason: "not-configured" });
  });

  it("closes at the pending cap before any per-identity query", async () => {
    const { store } = fakeStore({
      awaiting: askConfig.circuitBreaker.pendingCap,
    });
    const result = await submit(
      { target: THREAD, payload: payload(), requester: requester() },
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
      { target: THREAD, payload: payload(), requester: requester() },
      deps(store)
    );
    expect(result.kind).toBe("accepted");
  });

  it.each([
    ["pending-thread", { pendingThreads: 1 }],
    ["daily-cap", { today: askConfig.limits.dailyPerIp }],
  ] as [IdentityLimit, Partial<IdentityActivity>][])(
    "rate-limits an identity with a %s",
    async (limit, activity) => {
      const { store } = fakeStore({ activity });
      const result = await submit(
        { target: THREAD, payload: payload(), requester: requester() },
        deps(store)
      );

      expect(result).toEqual({ kind: "rate-limited", reason: limit });
      expect(store.hasUnreviewedDuplicate).not.toHaveBeenCalled();
    }
  );

  it("looks up by IP hash only when the cookie was just minted", async () => {
    const withCookie = fakeStore();
    await submit(
      { target: THREAD, payload: payload(), requester: requester() },
      deps(withCookie.store)
    );
    expect(withCookie.lookups[0]).toEqual({
      anonId: "anon-123",
      ipHash: null,
      networkHash: "abcdef123456",
      pendingSince: "2026-09-18T12:00:00.000Z",
      dailySince: "2026-09-24T12:00:00.000Z",
    });

    const fresh = fakeStore();
    await submit(
      {
        target: THREAD,
        payload: payload(),
        requester: requester({ fromCookie: false }),
      },
      deps(fresh.store)
    );
    expect(fresh.lookups[0]?.ipHash).toBe("abcdef123456");
  });

  it("never matches messages on the shared bucket when no proxy is trusted", async () => {
    const { store, lookups } = fakeStore();
    await submit(
      {
        target: THREAD,
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

  it("uses the larger global cap for the shared bucket", async () => {
    const belowGlobal = fakeStore({
      activity: { today: askConfig.limits.dailyWithoutTrustedProxy - 1 },
    });
    expect(
      await submit(
        { target: THREAD, payload: payload(), requester: requester({}, false) },
        deps(belowGlobal.store)
      )
    ).toMatchObject({ kind: "accepted" });

    const atGlobal = fakeStore({
      activity: { today: askConfig.limits.dailyWithoutTrustedProxy },
    });
    expect(
      await submit(
        { target: THREAD, payload: payload(), requester: requester({}, false) },
        deps(atGlobal.store)
      )
    ).toEqual({ kind: "rate-limited", reason: "daily-cap" });
  });

  it("answers a pending duplicate as accepted but writes nothing", async () => {
    const { store, created } = fakeStore({ duplicate: true });
    const result = await submit(
      { target: THREAD, payload: payload(), requester: requester() },
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
      submit(
        { target: THREAD, payload: payload(), requester: requester() },
        deps(store)
      )
    ).rejects.toThrow("down");
  });

  it("publishes the owner's thread at once, skipping the visitor guards", async () => {
    const { store, created } = fakeStore({
      awaiting: askConfig.circuitBreaker.pendingCap,
      activity: { pendingThreads: 5, today: 999 },
      duplicate: true,
    });
    const result = await submit(
      {
        target: THREAD,
        payload: payload({
          elapsed: 0,
          body: "SHOUTING https://a.io https://b.io https://c.io",
        }),
        requester: owner(),
      },
      deps(store)
    );

    expect(result).toEqual({
      kind: "accepted",
      slug: "Slug1234",
      status: "published",
    });
    expect(created[0]).toMatchObject({
      by: "owner",
      status: "published",
      publishedAt: AT,
      lastActivityAt: AT,
      author: { anonId: undefined },
      moderation: undefined,
    });
    expect(store.countAwaitingReview).not.toHaveBeenCalled();
    expect(store.countIdentityActivity).not.toHaveBeenCalled();
  });

  it("still validates the owner's message", async () => {
    const { store } = fakeStore();
    const result = await submit(
      { target: THREAD, payload: payload({ body: "hi" }), requester: owner() },
      deps(store)
    );
    expect(result.kind).toBe("invalid");
  });
});

describe("submit: replies", () => {
  it("appends a visitor reply as pending, without touching lastActivityAt", async () => {
    const { store, appended } = fakeStore();
    const result = await submit(
      {
        target: REPLY,
        payload: payload({ name: "Sam" }),
        requester: requester(),
      },
      deps(store)
    );

    expect(result).toEqual({
      kind: "accepted",
      slug: "Thread12",
      key: "key-1",
      status: "pending",
    });
    expect(store.findThread).toHaveBeenCalledWith("Thread12");
    expect(appended).toEqual([
      {
        threadId: "question-1",
        at: undefined,
        reply: {
          _key: "key-1",
          by: "visitor",
          authorName: "Sam",
          anonId: "anon-123",
          body,
          createdAt: AT,
          status: "pending",
          moderation,
        },
      },
    ]);
  });

  it.each([
    ["missing", null],
    ["pending", { id: "question-1", status: "pending" as const }],
    ["rejected", { id: "question-1", status: "rejected" as const }],
  ])("returns not-found for a %s thread", async (_label, thread) => {
    const { store, appended } = fakeStore({ thread });
    const result = await submit(
      { target: REPLY, payload: payload(), requester: requester() },
      deps(store)
    );
    expect(result).toEqual({ kind: "not-found" });
    expect(appended).toHaveLength(0);
    expect(store.countIdentityActivity).not.toHaveBeenCalled();
  });

  it.each([
    ["reply-cap", { repliesToday: askConfig.limits.repliesPerDay }],
    ["daily-cap", { today: askConfig.limits.dailyPerIp }],
  ] as [IdentityLimit, Partial<IdentityActivity>][])(
    "rate-limits a reply at the %s",
    async (limit, activity) => {
      const { store, appended } = fakeStore({ activity });
      const result = await submit(
        { target: REPLY, payload: payload(), requester: requester() },
        deps(store)
      );
      expect(result).toEqual({ kind: "rate-limited", reason: limit });
      expect(appended).toHaveLength(0);
    }
  );

  it("limits pending replies per identity", async () => {
    const { store } = fakeStore({
      activity: {
        pendingReplies: askConfig.limits.pendingRepliesPerIdentity,
        repliesToday: 0,
      },
    });
    expect(
      await submit(
        { target: REPLY, payload: payload(), requester: requester() },
        deps(store)
      )
    ).toEqual({ kind: "rate-limited", reason: "pending-replies" });
  });

  it("is not blocked by the sender's own pending thread", async () => {
    const { store } = fakeStore({ activity: { pendingThreads: 1 } });
    expect(
      await submit(
        { target: REPLY, payload: payload(), requester: requester() },
        deps(store)
      )
    ).toMatchObject({ kind: "accepted", status: "pending" });
  });

  it("returns a decoy key for a filled honeypot without looking up the thread", async () => {
    const { store } = fakeStore();
    const result = await submit(
      {
        target: REPLY,
        payload: payload({ website: "x" }),
        requester: requester(),
      },
      deps(store)
    );
    expect(result).toEqual({
      kind: "discarded",
      slug: "Thread12",
      key: "key-1",
      reason: "honeypot",
    });
    expect(store.findThread).not.toHaveBeenCalled();
  });

  it("discards a duplicate reply", async () => {
    const { store, appended } = fakeStore({ duplicate: true });
    expect(
      await submit(
        { target: REPLY, payload: payload(), requester: requester() },
        deps(store)
      )
    ).toMatchObject({ kind: "discarded", reason: "duplicate", key: "key-1" });
    expect(appended).toHaveLength(0);
  });

  it("publishes the owner's reply and bumps lastActivityAt", async () => {
    const { store, appended } = fakeStore({
      thread: { id: "question-9", status: "pending" },
    });
    const result = await submit(
      { target: REPLY, payload: payload(), requester: owner() },
      deps(store)
    );

    expect(result).toEqual({
      kind: "accepted",
      slug: "Thread12",
      key: "key-1",
      status: "published",
    });
    expect(appended[0]).toMatchObject({
      threadId: "question-9",
      at: AT,
      reply: { by: "owner", status: "published", anonId: undefined },
    });
    expect(store.countIdentityActivity).not.toHaveBeenCalled();
  });

  it("returns not-found for the owner when the thread is missing", async () => {
    const { store } = fakeStore({ thread: null });
    expect(
      await submit(
        { target: REPLY, payload: payload(), requester: owner() },
        deps(store)
      )
    ).toEqual({ kind: "not-found" });
  });
});
