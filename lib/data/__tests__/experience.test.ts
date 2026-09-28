import type { EXPERIENCE_QUERY_RESULT } from "@/sanity.types";
import { describe, expect, it } from "vitest";

import { linkContinuations, mapExperience } from "../experience";
import type { Experience } from "../types";

type ExperienceResult = EXPERIENCE_QUERY_RESULT[number];

function result(overrides: Partial<ExperienceResult> = {}): ExperienceResult {
  return {
    _id: "experience-acme",
    company: null,
    companyUrl: null,
    companyBlurb: null,
    title: null,
    location: null,
    remote: null,
    employmentType: null,
    employmentNote: null,
    startDate: null,
    endDate: null,
    endNote: null,
    continuedInto: null,
    continuationNote: null,
    note: null,
    body: null,
    highlights: null,
    ...overrides,
  };
}

function role(
  id: string,
  startDate: string,
  extra: Partial<Experience> = {}
): Experience {
  return {
    id,
    company: id.toUpperCase(),
    title: "Engineer",
    location: "Remote",
    remote: true,
    employmentType: "full-time",
    startDate,
    body: [],
    highlights: [],
    ...extra,
  };
}

describe("mapExperience", () => {
  it("fills defaults for empty fields", () => {
    expect(mapExperience(result())).toEqual({
      id: "acme",
      company: "",
      companyUrl: undefined,
      companyBlurb: undefined,
      title: "",
      location: "",
      remote: false,
      employmentType: "full-time",
      employmentNote: undefined,
      startDate: "",
      endDate: undefined,
      endNote: undefined,
      continuedInto: undefined,
      body: [],
      highlights: [],
    });
  });

  it("maps a complete role", () => {
    const body = [{ _type: "block" as const, _key: "b1", children: [] }];
    const mapped = mapExperience(
      result({
        _id: "experience-proghit",
        company: "Proghit",
        companyUrl: "https://proghit.example",
        title: "Frontend Lead",
        location: "New York",
        remote: true,
        employmentType: "freelance",
        startDate: "2024-09-01",
        endDate: "2026-01-01",
        note: "Why it mattered",
        body,
        highlights: ["Led the frontend"],
      })
    );
    expect(mapped).toMatchObject({
      id: "proghit",
      company: "Proghit",
      companyUrl: "https://proghit.example",
      remote: true,
      employmentType: "freelance",
      startDate: "2024-09-01",
      endDate: "2026-01-01",
      note: "Why it mattered",
      body,
      highlights: ["Led the frontend"],
    });
  });

  it("maps the successor reference with the continuation note", () => {
    const mapped = mapExperience(
      result({
        continuedInto: { _id: "experience-zunta", company: "Zunta" },
        continuationNote: "Moved with my manager",
      })
    );
    expect(mapped.continuedInto).toEqual({
      id: "zunta",
      company: "Zunta",
      note: "Moved with my manager",
    });
  });

  it("strips the drafts prefix from the successor id", () => {
    const mapped = mapExperience(
      result({
        continuedInto: { _id: "drafts.experience-zunta", company: null },
      })
    );
    expect(mapped.continuedInto).toEqual({
      id: "zunta",
      company: "",
      note: undefined,
    });
  });
});

describe("linkContinuations", () => {
  it("derives continuedFrom on the successor from its predecessor", () => {
    const linked = linkContinuations([
      role("old", "2023-01-01", {
        continuedInto: { id: "new", company: "NEW", note: "Team moved" },
      }),
      role("new", "2024-01-01"),
    ]);

    const successor = linked.find((r) => r.id === "new");
    const predecessor = linked.find((r) => r.id === "old");
    expect(successor?.continuedFrom).toEqual({
      id: "old",
      company: "OLD",
      note: "Team moved",
    });
    expect(predecessor?.continuedFrom).toBeUndefined();
    expect(predecessor?.continuedInto?.id).toBe("new");
  });

  it("sorts roles newest first", () => {
    const linked = linkContinuations([
      role("b", "2023-06-01"),
      role("c", "2025-01-01"),
      role("a", "2021-03-01"),
    ]);
    expect(linked.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("keeps the incoming order for roles that start together", () => {
    const linked = linkContinuations([
      role("first", "2024-09-01"),
      role("second", "2024-09-01"),
    ]);
    expect(linked.map((r) => r.id)).toEqual(["first", "second"]);
  });

  it("drops a stored continuedFrom that no predecessor backs", () => {
    const [only] = linkContinuations([
      role("solo", "2024-01-01", {
        continuedFrom: { id: "ghost", company: "GHOST" },
      }),
    ]);
    expect(only).not.toHaveProperty("continuedFrom");
  });

  it("ignores a continuation pointing at a role that is not in the list", () => {
    const linked = linkContinuations([
      role("old", "2023-01-01", {
        continuedInto: { id: "missing", company: "MISSING" },
      }),
    ]);
    expect(linked).toHaveLength(1);
    expect(linked[0]?.continuedFrom).toBeUndefined();
  });

  it("links chains of continuations", () => {
    const linked = linkContinuations([
      role("a", "2020-01-01", { continuedInto: { id: "b", company: "B" } }),
      role("b", "2021-01-01", { continuedInto: { id: "c", company: "C" } }),
      role("c", "2022-01-01"),
    ]);
    expect(
      linked.map((r) => [r.id, r.continuedFrom?.id, r.continuedInto?.id])
    ).toEqual([
      ["c", "b", undefined],
      ["b", "a", "c"],
      ["a", undefined, "b"],
    ]);
  });

  it("does not mutate its input", () => {
    const roles = [
      role("old", "2023-01-01", {
        continuedInto: { id: "new", company: "NEW" },
      }),
      role("new", "2024-01-01"),
    ];
    const snapshot = structuredClone(roles);
    linkContinuations(roles);
    expect(roles).toEqual(snapshot);
  });
});
