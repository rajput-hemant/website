import { describe, expect, it } from "vitest";

import {
  LEGACY_ANSWER_KEY,
  legacyAnswerText,
  migrateLegacyAnswer,
} from "../legacy-answer";

const answer = [
  {
    _type: "block",
    _key: "b1",
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: "s1", text: "Mostly curiosity.", marks: [] },
    ],
  },
  {
    _type: "block",
    _key: "b2",
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: "s2", text: "And good mentors.", marks: [] },
    ],
  },
];

describe("legacyAnswerText", () => {
  it("flattens Portable Text to plain paragraphs", () => {
    expect(legacyAnswerText(answer)).toBe(
      "Mostly curiosity.\n\nAnd good mentors."
    );
  });

  it("is empty for missing or empty answers", () => {
    expect(legacyAnswerText(null)).toBe("");
    expect(legacyAnswerText([])).toBe("");
  });
});

describe("migrateLegacyAnswer", () => {
  const doc = {
    _id: "question-abc",
    answer,
    submittedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-02T00:00:00.000Z",
    replies: [{ _key: "r1" }],
  };

  it("appends a published owner reply with a fixed key", () => {
    expect(migrateLegacyAnswer(doc, "2026-09-25T00:00:00.000Z")).toEqual({
      id: "question-abc",
      operations: {
        setIfMissing: { replies: [] },
        insert: {
          after: "replies[-1]",
          items: [
            {
              _type: "reply",
              _key: LEGACY_ANSWER_KEY,
              by: "owner",
              body: "Mostly curiosity.\n\nAnd good mentors.",
              createdAt: "2026-08-02T00:00:00.000Z",
              status: "published",
            },
          ],
        },
        set: { lastActivityAt: "2026-08-02T00:00:00.000Z" },
      },
    });
  });

  it("keeps a later lastActivityAt", () => {
    expect(
      migrateLegacyAnswer({
        ...doc,
        lastActivityAt: "2026-09-01T00:00:00.000Z",
      })?.operations.set
    ).toEqual({ lastActivityAt: "2026-09-01T00:00:00.000Z" });
  });

  it("is idempotent and skips documents without an answer", () => {
    expect(
      migrateLegacyAnswer({ ...doc, replies: [{ _key: LEGACY_ANSWER_KEY }] })
    ).toBeNull();
    expect(migrateLegacyAnswer({ ...doc, answer: null })).toBeNull();
    expect(migrateLegacyAnswer({ _id: "q", answer: [] })).toBeNull();
  });
});
