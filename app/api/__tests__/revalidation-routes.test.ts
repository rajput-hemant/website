import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSlug } from "@/lib/ask/slug";
import { sanityTags } from "@/sanity/lib/fetch";

import { POST as moderate } from "../ask/moderate/route";
import { POST as refresh } from "../owner/refresh/route";

const mocks = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  isOwnerRequest: vi.fn(),
  getQuestionStore: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/ask/owner-session", () => ({
  isOwnerRequest: mocks.isOwnerRequest,
}));
vi.mock("@/lib/ask/store", () => ({
  getQuestionStore: mocks.getQuestionStore,
}));
vi.mock("@/sanity/lib/fetch", () => ({
  sanityTags: [
    "profile",
    "experience",
    "project",
    "now",
    "update",
    "skillGroup",
    "education",
    "question",
  ],
}));

const post = (
  url: string,
  init: { body?: unknown; headers?: Record<string, string> } = {}
) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...init.headers },
    body: JSON.stringify(init.body ?? {}),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isOwnerRequest.mockResolvedValue(true);
});

describe("POST /api/ask/moderate", () => {
  const slug = createSlug();
  const thread = {
    _id: "q1",
    status: "published",
    publishedAt: "2026-09-01T00:00:00Z",
    replyKeys: [],
  };

  it("expires the question tag immediately after the write lands", async () => {
    const order: string[] = [];
    mocks.getQuestionStore.mockReturnValue({
      findThreadForModeration: vi.fn().mockResolvedValue(thread),
      setFields: vi.fn(() => {
        order.push("write");
        return Promise.resolve();
      }),
    });
    mocks.revalidateTag.mockImplementation(() => order.push("expire"));

    const response = await moderate(
      post("/api/ask/moderate", {
        body: { slug, target: "thread", action: "reject" },
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.revalidateTag).toHaveBeenCalledWith("question", { expire: 0 });
    expect(order).toEqual(["write", "expire"]);
  });

  it("does not expire anything for a non-owner", async () => {
    mocks.isOwnerRequest.mockResolvedValue(false);
    const response = await moderate(
      post("/api/ask/moderate", {
        body: { slug, target: "thread", action: "reject" },
      })
    );
    expect(response.status).toBe(401);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});

describe("POST /api/owner/refresh", () => {
  it("answers 401 to visitors and expires nothing", async () => {
    mocks.isOwnerRequest.mockResolvedValue(false);
    const response = await refresh(post("/api/owner/refresh"));
    expect(response.status).toBe(401);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects cross-site and non-JSON requests", async () => {
    const cross = await refresh(
      post("/api/owner/refresh", {
        headers: { "sec-fetch-site": "cross-site" },
      })
    );
    expect(cross.status).toBe(403);
    const form = await refresh(
      post("/api/owner/refresh", {
        headers: { "content-type": "text/plain" },
      })
    );
    expect(form.status).toBe(415);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("expires every Sanity tag for the owner, then rate limits", async () => {
    const headers = { "x-forwarded-for": "203.0.113.9" };
    const response = await refresh(post("/api/owner/refresh", { headers }));
    expect(response.status).toBe(200);
    for (const tag of sanityTags) {
      expect(mocks.revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 });
    }
    expect(mocks.revalidateTag).toHaveBeenCalledTimes(sanityTags.length);

    for (let i = 0; i < 5; i += 1) {
      await refresh(post("/api/owner/refresh", { headers }));
    }
    const limited = await refresh(post("/api/owner/refresh", { headers }));
    expect(limited.status).toBe(429);
  });
});
