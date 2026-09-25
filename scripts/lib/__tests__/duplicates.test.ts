import { describe, expect, it } from "vitest";

import {
  findDuplicateGroups,
  formatDuplicateReport,
  idsToDelete,
  naturalKey,
  seedOwnedIds,
  type ContentDocument,
} from "../duplicates";

const doc = (
  _id: string,
  fields: Partial<ContentDocument> & { _type: string }
): ContentDocument => ({ _id, _updatedAt: "2026-01-01T00:00:00Z", ...fields });

const intermediate = {
  _type: "education",
  institution: "Gyan Deep Shiksha Bharati",
  degree: "Intermediate (CBSE)",
  endYear: 2020,
};

const seedIds = new Set(["education-gyan-deep-intermediate"]);

describe("naturalKey", () => {
  it("normalises case and spacing in text parts", () => {
    expect(
      naturalKey(
        doc("a", {
          ...intermediate,
          institution: "  gyan deep   SHIKSHA bharati",
        })
      )
    ).toBe(naturalKey(doc("b", intermediate)));
  });

  it("keys each checked type by its natural fields", () => {
    expect(naturalKey(doc("a", intermediate))).toBe(
      "gyan deep shiksha bharati | intermediate (cbse) | 2020"
    );
    expect(
      naturalKey(
        doc("a", {
          _type: "experience",
          company: "Zunta",
          startDate: "2024-09-01",
        })
      )
    ).toBe("zunta | 2024-09-01");
    expect(naturalKey(doc("a", { _type: "project", slug: "lipi" }))).toBe(
      "lipi"
    );
    expect(
      naturalKey(doc("a", { _type: "skillGroup", title: "Languages" }))
    ).toBe("languages");
    expect(
      naturalKey(
        doc("a", { _type: "update", date: "2026-09-01", text: "Shipped" })
      )
    ).toBe("2026-09-01 | shipped");
  });

  it("returns null for unchecked types and missing key fields", () => {
    expect(naturalKey(doc("a", { _type: "profile" }))).toBeNull();
    expect(naturalKey(doc("a", { ...intermediate, endYear: null }))).toBeNull();
    expect(naturalKey(doc("a", { _type: "project", slug: "" }))).toBeNull();
  });
});

describe("seedOwnedIds", () => {
  it("prefixes each fallback id with its document type", () => {
    const ids = seedOwnedIds({
      education: [{ id: "gla" }],
      experience: [{ id: "zunta" }],
      projects: [{ id: "lipi" }],
      skills: [{ id: "languages" }],
      changelog: [{ id: "launch" }],
    });
    expect([...ids]).toEqual([
      "education-gla",
      "experience-zunta",
      "project-lipi",
      "skillGroup-languages",
      "update-launch",
    ]);
  });
});

describe("findDuplicateGroups", () => {
  it("ignores documents without a duplicate", () => {
    expect(
      findDuplicateGroups(
        [
          doc("education-gyan-deep-intermediate", intermediate),
          doc("x", { ...intermediate, endYear: 2018 }),
        ],
        seedIds
      )
    ).toEqual([]);
  });

  it("keeps the seed-owned copy and removes the rest", () => {
    const [group, ...others] = findDuplicateGroups(
      [
        doc("manual-copy", {
          ...intermediate,
          _updatedAt: "2026-09-01T00:00:00Z",
        }),
        doc("education-gyan-deep-intermediate", intermediate),
      ],
      seedIds
    );
    expect(others).toEqual([]);
    expect(group?.type).toBe("education");
    expect(group?.keep.map((copy) => copy.id)).toEqual([
      "education-gyan-deep-intermediate",
    ]);
    expect(group?.keep[0]?.seedOwned).toBe(true);
    expect(group?.remove.map((copy) => copy.id)).toEqual(["manual-copy"]);
  });

  it("keeps the most recently updated copy when none is seed-owned", () => {
    const [group] = findDuplicateGroups(
      [
        doc("old", {
          _type: "project",
          slug: "lipi",
          _updatedAt: "2026-01-01T00:00:00Z",
        }),
        doc("new", {
          _type: "project",
          slug: "lipi",
          _updatedAt: "2026-05-01T00:00:00Z",
        }),
        doc("mid", {
          _type: "project",
          slug: "lipi",
          _updatedAt: "2026-03-01T00:00:00Z",
        }),
      ],
      seedIds
    );
    expect(group?.keep.map((copy) => copy.id)).toEqual(["new"]);
    expect(group?.remove.map((copy) => copy.id)).toEqual(["mid", "old"]);
  });

  it("treats a draft as part of its published document, and deletes both", () => {
    const groups = findDuplicateGroups(
      [
        doc("education-gyan-deep-intermediate", intermediate),
        doc("drafts.education-gyan-deep-intermediate", intermediate),
        doc("copy", intermediate),
        doc("drafts.copy", { ...intermediate, degree: "Edited in a draft" }),
      ],
      seedIds
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]?.remove[0]?.documentIds).toEqual(["copy", "drafts.copy"]);
    expect(idsToDelete(groups)).toEqual(["copy", "drafts.copy"]);
  });

  it("groups a draft-only document by its draft", () => {
    const groups = findDuplicateGroups(
      [
        doc("education-gyan-deep-intermediate", intermediate),
        doc("drafts.unpublished", intermediate),
      ],
      seedIds
    );
    expect(groups[0]?.remove.map((copy) => copy.documentIds)).toEqual([
      ["drafts.unpublished"],
    ]);
  });

  it("never groups documents of different types", () => {
    expect(
      findDuplicateGroups(
        [
          doc("a", { _type: "skillGroup", title: "Tools" }),
          doc("b", { _type: "project", slug: "tools" }),
        ],
        seedIds
      )
    ).toEqual([]);
  });
});

describe("formatDuplicateReport", () => {
  it("says so when there is nothing to fix", () => {
    expect(formatDuplicateReport([])).toBe("No duplicate content documents.");
  });

  it("lists each group with its keep and remove lines", () => {
    const groups = findDuplicateGroups(
      [
        doc("education-gyan-deep-intermediate", intermediate),
        doc("abc123", { ...intermediate, _updatedAt: "2026-02-01T00:00:00Z" }),
        doc("drafts.abc123", intermediate),
      ],
      seedIds
    );
    expect(formatDuplicateReport(groups)).toBe(
      [
        "education: gyan deep shiksha bharati | intermediate (cbse) | 2020",
        "  keep    education-gyan-deep-intermediate  updated 2026-01-01T00:00:00Z  (seed)",
        "  remove  abc123                            updated 2026-02-01T00:00:00Z  (has draft)",
      ].join("\n")
    );
  });
});
