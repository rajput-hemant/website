import { type SanityClient } from "next-sanity";
import { describe, expect, it, vi } from "vitest";

import { createSanityQuestionStore } from "../store";

function fakeClient(result: unknown) {
  const fetch = vi.fn(async () => result);
  return { fetch, client: { fetch } as unknown as SanityClient };
}

describe("createSanityQuestionStore", () => {
  it("counts pending plus spam submitted inside the window for the breaker", async () => {
    const { fetch, client } = fakeClient(4);
    const store = createSanityQuestionStore(client);

    await expect(
      store.countAwaitingReview("2026-09-24T12:00:00.000Z")
    ).resolves.toBe(4);
    const [query, params] = fetch.mock.calls[0] as unknown as [string, object];
    expect(query).toContain('status == "pending"');
    expect(query).toContain('status == "spam" && submittedAt > $spamSince');
    expect(params).toEqual({ spamSince: "2026-09-24T12:00:00.000Z" });
  });

  it("counts identity activity, including today's submissions per network", async () => {
    const activity = { open: 0, cooldown: 0, today: 2 };
    const { fetch, client } = fakeClient(activity);
    const lookup = {
      anonId: "anon-123",
      ipHash: null,
      networkHash: "abcdef123456",
      openSince: "2026-09-18T12:00:00.000Z",
      cooldownSince: "2026-09-24T12:00:00.000Z",
      dailySince: "2026-09-24T12:00:00.000Z",
    };

    await expect(
      createSanityQuestionStore(client).countIdentityActivity(lookup)
    ).resolves.toEqual(activity);
    const [query, params] = fetch.mock.calls[0] as unknown as [string, object];
    expect(query).toContain("moderation.ipHash == $networkHash");
    expect(params).toEqual(lookup);
  });

  it("treats a spam body as a duplicate too", async () => {
    const { fetch, client } = fakeClient(1);
    await expect(
      createSanityQuestionStore(client).hasUnreviewedDuplicate("hello there")
    ).resolves.toBe(true);
    const [query] = fetch.mock.calls[0] as unknown as [string];
    expect(query).toContain('status in ["pending", "spam"]');
  });
});
