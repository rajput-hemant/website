import { describe, expect, it, vi } from "vitest";

import { dedupeDocuments } from "../dedupe";

const silent = () => undefined;

describe("dedupeDocuments", () => {
  it("drops a hand-entered copy that differs only in punctuation", () => {
    const docs = [
      {
        _id: "education-gla-university-btech",
        institution: "GLA University",
        degree: "B.Tech, Computer Science and Engineering",
        endYear: 2024,
      },
      {
        _id: "5f1c9a",
        institution: "GLA University",
        degree: "B.Tech Computer Science and Engineering",
        endYear: 2024,
      },
    ];
    expect(dedupeDocuments("education", docs, silent)).toEqual([docs[0]]);
  });

  it("prefers the seeded copy and keeps the first copy's position", () => {
    const onDuplicate = vi.fn();
    const docs = [
      { _id: "a1", slug: "jiosaavn-api" },
      { _id: "project-lipi", slug: "lipi" },
      { _id: "project-jiosaavn-api", slug: "jiosaavn-api" },
    ];
    expect(dedupeDocuments("project", docs, onDuplicate)).toEqual([
      docs[2],
      docs[1],
    ]);
    expect(onDuplicate).toHaveBeenCalledWith(["a1"]);
  });

  it("keeps distinct documents and those without a complete key", () => {
    const onDuplicate = vi.fn();
    const docs = [
      { _id: "project-jiosaavn-api", slug: "jiosaavn-api" },
      { _id: "project-jiosaavn-api-rs", slug: "jiosaavn-api-rs" },
      { _id: "x", slug: null },
      { _id: "y", slug: null },
    ];
    expect(dedupeDocuments("project", docs, onDuplicate)).toEqual(docs);
    expect(onDuplicate).not.toHaveBeenCalled();
  });
});
