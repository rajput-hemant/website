import { type SanityClient } from "next-sanity";
import { describe, expect, it, vi } from "vitest";

import { createSanityQuestionStore, type NewReply } from "../store";

function fakeClient(result: unknown) {
  const fetch = vi.fn(async () => result);
  return { fetch, client: { fetch } as unknown as SanityClient };
}

function fakePatchClient() {
  const calls: [string, unknown][] = [];
  const builder = {
    setIfMissing: vi.fn((value: unknown) => {
      calls.push(["setIfMissing", value]);
      return builder;
    }),
    append: vi.fn((path: string, items: unknown) => {
      calls.push(["append", { path, items }]);
      return builder;
    }),
    set: vi.fn((value: unknown) => {
      calls.push(["set", value]);
      return builder;
    }),
    commit: vi.fn(async () => ({})),
  };
  const patch = vi.fn(() => builder);
  return {
    calls,
    patch,
    builder,
    client: { patch } as unknown as SanityClient,
  };
}

const lookup = {
  anonId: "anon-123",
  ipHash: null,
  networkHash: "abcdef123456",
  pendingSince: "2026-09-18T12:00:00.000Z",
  dailySince: "2026-09-24T12:00:00.000Z",
};

describe("createSanityQuestionStore", () => {
  it("counts pending plus recent spam threads and replies for the breaker", async () => {
    const { fetch, client } = fakeClient({
      threads: 4,
      replies: [{ n: 2 }, { n: 1 }],
    });
    const store = createSanityQuestionStore(client);

    await expect(
      store.countAwaitingReview("2026-09-24T12:00:00.000Z")
    ).resolves.toBe(7);
    const [query, params] = fetch.mock.calls[0] as unknown as [string, object];
    expect(query).toContain('status == "pending"');
    expect(query).toContain('status == "spam" && submittedAt > $spamSince');
    expect(query).toContain('status == "spam" && createdAt > $spamSince');
    expect(params).toEqual({ spamSince: "2026-09-24T12:00:00.000Z" });
  });

  it("sums identity activity across threads and replies", async () => {
    const { fetch, client } = fakeClient({
      pendingThreads: 1,
      pendingReplies: [{ n: 2 }],
      repliesToday: [{ n: 1 }, { n: 2 }],
      threadsFromNetwork: 2,
      repliesFromNetwork: [{ n: 4 }],
    });

    await expect(
      createSanityQuestionStore(client).countIdentityActivity(lookup)
    ).resolves.toEqual({
      pendingThreads: 1,
      pendingReplies: 2,
      repliesToday: 3,
      today: 6,
    });
    const [query, params] = fetch.mock.calls[0] as unknown as [string, object];
    expect(query).toContain("moderation.ipHash == $networkHash");
    expect(query).toContain("anonId == $anonId");
    expect(params).toEqual(lookup);
  });

  it("treats a pending or spam reply body as a duplicate too", async () => {
    const { fetch, client } = fakeClient(1);
    await expect(
      createSanityQuestionStore(client).hasUnreviewedDuplicate("hello there")
    ).resolves.toBe(true);
    const [query] = fetch.mock.calls[0] as unknown as [string];
    expect(query).toContain('status in ["pending", "spam"]');
    expect(query).toContain("count(replies[");
  });

  it("finds a thread by slug, defaulting a missing status to pending", async () => {
    const found = fakeClient({ id: "q1", status: null });
    await expect(
      createSanityQuestionStore(found.client).findThread("Slug1234")
    ).resolves.toEqual({ id: "q1", status: "pending" });

    const missing = fakeClient(null);
    await expect(
      createSanityQuestionStore(missing.client).findThread("Slug1234")
    ).resolves.toBeNull();
  });

  it("appends a reply atomically and sets lastActivityAt when published", async () => {
    const { calls, patch, builder, client } = fakePatchClient();
    const reply: NewReply = {
      _key: "k1",
      by: "owner",
      body: "Thanks!",
      createdAt: "2026-09-25T12:00:00.000Z",
      status: "published",
    };

    await createSanityQuestionStore(client).appendReply(
      "q1",
      reply,
      "2026-09-25T12:00:00.000Z"
    );

    expect(patch).toHaveBeenCalledWith("q1");
    expect(calls).toEqual([
      ["setIfMissing", { replies: [] }],
      ["append", { path: "replies", items: [{ _type: "reply", ...reply }] }],
      ["set", { lastActivityAt: "2026-09-25T12:00:00.000Z" }],
    ]);
    expect(builder.commit).toHaveBeenCalledOnce();
  });

  it("leaves lastActivityAt alone for a pending reply", async () => {
    const { calls, client } = fakePatchClient();
    await createSanityQuestionStore(client).appendReply("q1", {
      _key: "k2",
      by: "visitor",
      body: "Hi there",
      createdAt: "2026-09-25T12:00:00.000Z",
      status: "pending",
    });
    expect(calls.map(([op]) => op)).toEqual(["setIfMissing", "append"]);
  });

  it("marks owner threads with the owner author kind", async () => {
    const create = vi.fn(async () => ({}));
    const client = { create } as unknown as SanityClient;
    await createSanityQuestionStore(client).createQuestion({
      by: "owner",
      body: "A note from me",
      author: {},
      status: "published",
      slug: "Slug1234",
      submittedAt: "2026-09-25T12:00:00.000Z",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: "question",
        author: { kind: "owner" },
        status: "published",
        replies: [],
      })
    );
  });
});
