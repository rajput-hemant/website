import { describe, expect, it } from "vitest";

import {
  buildModerationPatch,
  parseModerateRequest,
  toModerationItems,
  type ModerationThread,
} from "../moderation";

const NOW = "2026-09-25T12:00:00.000Z";
const thread: ModerationThread = {
  _id: "q1",
  status: "pending",
  publishedAt: null,
  replyKeys: ["k1", "legacy-answer"],
};

describe("parseModerateRequest", () => {
  it("accepts thread and reply targets", () => {
    expect(
      parseModerateRequest({
        slug: "Slug1234",
        target: "thread",
        action: "publish",
      })
    ).toEqual({ slug: "Slug1234", target: "thread", action: "publish" });
    expect(
      parseModerateRequest({
        slug: "Slug1234",
        target: "0f8e2c1a-1b2c-4d5e-8f90-123456789abc",
        action: "spam",
      })
    ).toMatchObject({ action: "spam" });
  });

  it("rejects bad slugs, actions and keys that could escape the patch path", () => {
    for (const input of [
      null,
      { slug: "short", target: "thread", action: "publish" },
      { slug: "Slug1234", target: "thread", action: "delete" },
      { slug: "Slug1234", target: 'k1"].x', action: "reject" },
      { slug: "Slug1234", target: "", action: "reject" },
    ]) {
      expect(parseModerateRequest(input)).toBeNull();
    }
  });
});

describe("buildModerationPatch", () => {
  it("publishes a thread, setting publishedAt once and bumping activity", () => {
    expect(
      buildModerationPatch(thread, { target: "thread", action: "publish" }, NOW)
    ).toEqual({ status: "published", lastActivityAt: NOW, publishedAt: NOW });
    expect(
      buildModerationPatch(
        { ...thread, publishedAt: "2026-09-01T00:00:00.000Z" },
        { target: "thread", action: "publish" },
        NOW
      )
    ).toEqual({ status: "published", lastActivityAt: NOW });
  });

  it("rejects or marks a thread as spam without touching activity", () => {
    expect(
      buildModerationPatch(thread, { target: "thread", action: "reject" }, NOW)
    ).toEqual({ status: "rejected" });
    expect(
      buildModerationPatch(thread, { target: "thread", action: "spam" }, NOW)
    ).toEqual({ status: "spam" });
  });

  it("targets one reply by key", () => {
    expect(
      buildModerationPatch(thread, { target: "k1", action: "publish" }, NOW)
    ).toEqual({
      'replies[_key=="k1"].status': "published",
      lastActivityAt: NOW,
    });
    expect(
      buildModerationPatch(thread, { target: "k1", action: "reject" }, NOW)
    ).toEqual({ 'replies[_key=="k1"].status': "rejected" });
  });

  it("returns null for a reply key the thread does not have", () => {
    expect(
      buildModerationPatch(thread, { target: "nope", action: "publish" }, NOW)
    ).toBeNull();
    expect(
      buildModerationPatch(
        { ...thread, replyKeys: null },
        { target: "k1", action: "publish" },
        NOW
      )
    ).toBeNull();
  });
});

describe("toModerationItems", () => {
  it("flattens threads and replies, newest first, skipping incomplete rows", () => {
    const items = toModerationItems({
      threads: [
        {
          slug: "Thread01",
          body: "First question",
          authorName: null,
          submittedAt: "2026-09-24T10:00:00.000Z",
          status: "pending",
        },
        {
          slug: null,
          body: "orphan",
          authorName: null,
          submittedAt: "2026-09-24T11:00:00.000Z",
          status: "pending",
        },
      ],
      replies: [
        {
          slug: "Thread02",
          body: "Published thread",
          replies: [
            {
              _key: "k1",
              by: "visitor",
              authorName: "Sam",
              body: "A reply",
              createdAt: "2026-09-25T09:00:00.000Z",
              status: "spam",
            },
            {
              _key: null,
              by: "visitor",
              authorName: null,
              body: "no key",
              createdAt: "2026-09-25T10:00:00.000Z",
              status: "pending",
            },
          ],
        },
      ],
    });

    expect(items).toEqual([
      {
        kind: "reply",
        slug: "Thread02",
        threadBody: "Published thread",
        reply: {
          key: "k1",
          by: "visitor",
          authorName: "Sam",
          body: "A reply",
          createdAt: "2026-09-25T09:00:00.000Z",
          status: "spam",
        },
      },
      {
        kind: "thread",
        slug: "Thread01",
        body: "First question",
        authorName: undefined,
        submittedAt: "2026-09-24T10:00:00.000Z",
        status: "pending",
      },
    ]);
  });
});
