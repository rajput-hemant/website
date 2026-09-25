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
      body: null,
      authorName: null,
      status: "published",
      answer: null,
      replies: null,
      submittedAt: null,
      publishedAt: null,
      ...overrides,
    };
  }

  it("fills defaults and leaves an empty answer undefined", () => {
    expect(mapQuestion(question({ answer: [] }))).toEqual({
      id: "q-123",
      slug: "",
      body: "",
      authorName: undefined,
      status: "published",
      answer: undefined,
      replies: [],
      submittedAt: "",
      publishedAt: undefined,
    });
  });

  it("keeps a non-empty answer and only complete replies", () => {
    const answer = [{ _type: "block" as const, _key: "a", children: [] }];
    const mapped = mapQuestion(
      question({
        slug: "abcd1234",
        body: "How do you test?",
        authorName: "Sam",
        answer,
        replies: [
          { by: "owner", body: "Thanks!", createdAt: "2026-09-02" },
          { by: null, body: "orphan", createdAt: "2026-09-03" },
          { by: "visitor", body: null, createdAt: "2026-09-04" },
        ],
        submittedAt: "2026-09-01",
        publishedAt: "2026-09-02",
      })
    );
    expect(mapped).toMatchObject({
      slug: "abcd1234",
      authorName: "Sam",
      answer,
      replies: [{ by: "owner", body: "Thanks!", createdAt: "2026-09-02" }],
      publishedAt: "2026-09-02",
    });
  });
});
