import type {
  CHANGELOG_QUERY_RESULT,
  EDUCATION_QUERY_RESULT,
  QUESTIONS_QUERY_RESULT,
} from "@/sanity.types";
import { describe, expect, it } from "vitest";

import { mapUpdate, sortChangelog } from "../changelog";
import { mapEducation } from "../education";
import { mapNow } from "../now";
import { mapQuestion } from "../questions";
import { mapSkillGroup } from "../skills";
import type { Update } from "../types";

type QuestionResult = QUESTIONS_QUERY_RESULT["items"][number];

describe("mapUpdate", () => {
  it("fills defaults and strips the id prefix", () => {
    const empty: CHANGELOG_QUERY_RESULT[number] = {
      _id: "update-launch",
      date: null,
      text: null,
      category: null,
      link: null,
    };
    expect(mapUpdate(empty)).toEqual({
      id: "launch",
      date: "",
      text: "",
      category: "site",
      link: undefined,
    });
  });

  it("maps a complete entry", () => {
    expect(
      mapUpdate({
        _id: "update-lipi",
        date: "2026-03-01",
        text: "Shipped Lipi",
        category: "project",
        link: "/projects/lipi",
      })
    ).toEqual({
      id: "lipi",
      date: "2026-03-01",
      text: "Shipped Lipi",
      category: "project",
      link: "/projects/lipi",
    });
  });
});

describe("sortChangelog", () => {
  const update = (id: string, date: string): Update => ({
    id,
    date,
    text: id,
    category: "site",
  });

  it("orders entries newest first without mutating the input", () => {
    const input = [
      update("mid", "2025-06-01"),
      update("new", "2026-01-15"),
      update("old", "2024-02-01"),
    ];
    expect(sortChangelog(input).map((u) => u.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
    expect(input.map((u) => u.id)).toEqual(["mid", "new", "old"]);
  });
});

describe("mapEducation", () => {
  it("fills defaults for empty fields", () => {
    const empty: EDUCATION_QUERY_RESULT[number] = {
      _id: "education-btech",
      institution: null,
      degree: null,
      location: null,
      startYear: null,
      endYear: null,
      score: null,
    };
    expect(mapEducation(empty)).toEqual({
      id: "btech",
      institution: "",
      degree: "",
      location: "",
      startYear: undefined,
      endYear: 0,
      score: undefined,
    });
  });
});

describe("mapNow", () => {
  it("drops items without text and keeps optional links", () => {
    expect(
      mapNow({
        items: [
          { text: "Building Payments V2", link: null },
          { text: null, link: "https://example.com" },
          { text: "Reading", link: "https://example.com/book" },
        ],
        updatedAt: "2026-09-01",
      })
    ).toEqual({
      items: [
        { text: "Building Payments V2", link: undefined },
        { text: "Reading", link: "https://example.com/book" },
      ],
      updatedAt: "2026-09-01",
    });
  });

  it("handles missing items and date", () => {
    expect(mapNow({ items: null, updatedAt: null })).toEqual({
      items: [],
      updatedAt: "",
    });
  });
});

describe("mapSkillGroup", () => {
  it("strips the id prefix and defaults items", () => {
    expect(
      mapSkillGroup({ _id: "skillGroup-frontend", title: null, items: null })
    ).toEqual({ id: "frontend", title: "", items: [] });
  });
});

describe("mapQuestion", () => {
  function question(overrides: Partial<QuestionResult> = {}): QuestionResult {
    return {
      _id: "q-123",
      slug: null,
      by: "visitor",
      body: null,
      authorName: null,
      status: "published",
      answer: null,
      replies: null,
      submittedAt: null,
      publishedAt: null,
      lastActivityAt: null,
      ...overrides,
    };
  }

  const reply = (
    overrides: Partial<NonNullable<QuestionResult["replies"]>[number]>
  ) => ({
    _key: "r1",
    by: "visitor" as const,
    authorName: null,
    body: "Hello",
    createdAt: "2026-09-02T00:00:00.000Z",
    ...overrides,
  });

  it("fills defaults", () => {
    expect(mapQuestion(question({ answer: [] }))).toEqual({
      id: "q-123",
      slug: "",
      by: "visitor",
      body: "",
      authorName: undefined,
      status: "published",
      replies: [],
      submittedAt: "",
      publishedAt: undefined,
      lastActivityAt: "",
    });
  });

  it("drops a slug that isn't a plain permalink string, instead of passing it through", () => {
    // The query normalises `slug.current` to a string, but a document written
    // by other code (or hand-seeded) can still carry the raw Sanity `slug`
    // object. Passing that through crashes generateStaticParams.
    const objectSlug = { _type: "slug", current: "abcd1234" };
    expect(
      mapQuestion(question({ slug: objectSlug as unknown as string })).slug
    ).toBe("");
    expect(mapQuestion(question({ slug: null })).slug).toBe("");
  });

  it("keeps only complete replies, oldest first, with keys and names", () => {
    const mapped = mapQuestion(
      question({
        slug: "abcd1234",
        body: "How do you test?",
        authorName: "Sam",
        replies: [
          reply({
            _key: "b",
            by: "owner",
            body: "Thanks!",
            createdAt: "2026-09-03T00:00:00.000Z",
          }),
          reply({
            _key: "a",
            authorName: "Sam",
            createdAt: "2026-09-02T00:00:00.000Z",
          }),
          reply({ _key: "c", by: null }),
          reply({ _key: "d", body: null }),
        ],
        submittedAt: "2026-09-01T00:00:00.000Z",
        publishedAt: "2026-09-01T12:00:00.000Z",
      })
    );
    expect(mapped.replies).toEqual([
      {
        key: "a",
        by: "visitor",
        authorName: "Sam",
        body: "Hello",
        createdAt: "2026-09-02T00:00:00.000Z",
        status: "published",
      },
      {
        key: "b",
        by: "owner",
        authorName: undefined,
        body: "Thanks!",
        createdAt: "2026-09-03T00:00:00.000Z",
        status: "published",
      },
    ]);
    expect(mapped.lastActivityAt).toBe("2026-09-03T00:00:00.000Z");
  });

  it("marks owner threads", () => {
    expect(mapQuestion(question({ by: "owner" })).by).toBe("owner");
  });

  it("uses lastActivityAt, then publishedAt, then submittedAt", () => {
    expect(
      mapQuestion(
        question({
          submittedAt: "2026-09-01T00:00:00.000Z",
          publishedAt: "2026-09-02T00:00:00.000Z",
          lastActivityAt: "2026-09-05T00:00:00.000Z",
        })
      ).lastActivityAt
    ).toBe("2026-09-05T00:00:00.000Z");
    expect(
      mapQuestion(
        question({
          submittedAt: "2026-09-01T00:00:00.000Z",
          publishedAt: "2026-09-02T00:00:00.000Z",
        })
      ).lastActivityAt
    ).toBe("2026-09-02T00:00:00.000Z");
  });

  describe("legacy answers", () => {
    const answer = [
      {
        _type: "block" as const,
        _key: "a",
        style: "normal" as const,
        markDefs: [],
        children: [
          {
            _type: "span" as const,
            _key: "s",
            text: "Unit tests first.",
            marks: [],
          },
        ],
      },
    ];

    it("folds an unmigrated answer into a published owner reply", () => {
      const mapped = mapQuestion(
        question({
          answer,
          replies: [reply({ createdAt: "2026-09-04T00:00:00.000Z" })],
          submittedAt: "2026-09-01T00:00:00.000Z",
          publishedAt: "2026-09-02T00:00:00.000Z",
        })
      );
      expect(mapped.replies[0]).toEqual({
        key: "legacy-answer",
        by: "owner",
        body: "Unit tests first.",
        createdAt: "2026-09-02T00:00:00.000Z",
        status: "published",
      });
      expect(mapped.replies).toHaveLength(2);
      expect(mapped).not.toHaveProperty("answer");
    });

    it("does not fold an answer the doctor already migrated", () => {
      const mapped = mapQuestion(
        question({
          answer,
          replies: [
            reply({
              _key: "legacy-answer",
              by: "owner",
              body: "Unit tests first.",
            }),
          ],
        })
      );
      expect(mapped.replies).toHaveLength(1);
    });
  });
});
