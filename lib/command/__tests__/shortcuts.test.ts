import { describe, expect, it } from "vitest";

import { GO_SEQUENCE_MS, goKeyFor, goSequence } from "../shortcuts";

const keys = { h: "/", w: "/work", p: "/projects" } as const;

const key = (k: string, extra: Partial<KeyboardEvent> = {}) => ({
  key: k,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  isComposing: false,
  ...extra,
});

describe("goKeyFor", () => {
  it("maps a page back to its key", () => {
    expect(goKeyFor("/work", keys)).toBe("w");
    expect(goKeyFor("/", keys)).toBe("h");
    expect(goKeyFor("/resume", keys)).toBeUndefined();
  });
});

describe("goSequence", () => {
  it("jumps when g was just typed into an empty field", () => {
    expect(goSequence("g", 1_000, key("w"), keys, 1_200)).toBe("/work");
    expect(goSequence("g", 1_000, key("P"), keys, 1_200)).toBe("/projects");
  });

  it("searches otherwise", () => {
    expect(goSequence("g", null, key("w"), keys, 1_200)).toBeUndefined();
    expect(goSequence("gi", 1_000, key("w"), keys, 1_200)).toBeUndefined();
    expect(goSequence("g", 1_000, key("x"), keys, 1_200)).toBeUndefined();
    expect(
      goSequence("g", 1_000, key("w"), keys, 1_000 + GO_SEQUENCE_MS + 1)
    ).toBeUndefined();
    expect(
      goSequence("g", 1_000, key("w", { metaKey: true }), keys, 1_200)
    ).toBeUndefined();
  });

  it("ignores keys inherited from Object", () => {
    expect(
      goSequence("g", 1_000, key("constructor"), keys, 1_200)
    ).toBeUndefined();
  });
});
