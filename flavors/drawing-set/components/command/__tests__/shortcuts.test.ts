import { describe, expect, it } from "vitest";

import { GO_SEQUENCE_MS, goKeyFor, goKeys, goSequence } from "../shortcuts";

describe("goKeys", () => {
  it("covers every primary jump once", () => {
    expect(Object.values(goKeys)).toEqual([
      "/",
      "/projects",
      "/work",
      "/lab",
      "/about",
      "/now",
    ]);
  });

  it("maps a page back to its key", () => {
    expect(goKeyFor("/lab")).toBe("l");
    expect(goKeyFor("/")).toBe("h");
    expect(goKeyFor("/resume")).toBeUndefined();
  });
});

describe("goSequence", () => {
  const key = (k: string, extra: Partial<KeyboardEvent> = {}) => ({
    key: k,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    isComposing: false,
    ...extra,
  });

  it("jumps when g was just typed into an empty field", () => {
    expect(goSequence("g", 1_000, key("p"), 1_200)).toBe("/projects");
    expect(goSequence("g", 1_000, key("E"), 1_200)).toBe("/work");
  });

  it("searches otherwise", () => {
    expect(goSequence("g", null, key("p"), 1_200)).toBeUndefined();
    expect(goSequence("gi", 1_000, key("p"), 1_200)).toBeUndefined();
    expect(goSequence("g", 1_000, key("x"), 1_200)).toBeUndefined();
    expect(
      goSequence("g", 1_000, key("p"), 1_000 + GO_SEQUENCE_MS + 1)
    ).toBeUndefined();
    expect(
      goSequence("g", 1_000, key("p", { metaKey: true }), 1_200)
    ).toBeUndefined();
  });
});
