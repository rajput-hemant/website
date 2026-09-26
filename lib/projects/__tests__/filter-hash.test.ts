import { describe, expect, it } from "vitest";

import {
  filterHash,
  matchesFilter,
  NO_FILTER,
  parseFilterHash,
} from "../filter-hash";

describe("parseFilterHash", () => {
  it("reads status and stack", () => {
    expect(parseFilterHash("#status=wip&stack=next")).toEqual({
      status: "wip",
      stack: "next",
    });
  });

  it("treats a project anchor or an empty hash as no filter", () => {
    expect(parseFilterHash("#lipi")).toEqual(NO_FILTER);
    expect(parseFilterHash("")).toEqual(NO_FILTER);
  });

  it("ignores an unknown status", () => {
    expect(parseFilterHash("#status=done&stack=Rust")).toEqual({
      status: null,
      stack: "rust",
    });
  });
});

describe("filterHash", () => {
  it("round-trips through parseFilterHash", () => {
    const filter = { status: "archived", stack: "tailwind-css" } as const;
    expect(parseFilterHash(`#${filterHash(filter)}`)).toEqual(filter);
  });

  it("is empty without a filter", () => {
    expect(filterHash(NO_FILTER)).toBe("");
  });
});

describe("matchesFilter", () => {
  const project = { status: "wip", stacks: ["next", "supabase"] };

  it("needs every set criterion to match", () => {
    expect(matchesFilter(project, NO_FILTER)).toBe(true);
    expect(matchesFilter(project, { status: "wip", stack: "next" })).toBe(true);
    expect(matchesFilter(project, { status: "wip", stack: "rust" })).toBe(
      false
    );
    expect(matchesFilter(project, { status: "active", stack: null })).toBe(
      false
    );
  });
});
