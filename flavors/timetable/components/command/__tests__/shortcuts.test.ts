import { describe, expect, it } from "vitest";

import { goKeyFor, goKeys, goSequence } from "../shortcuts";

const key = (k: string) => ({
  key: k,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  isComposing: false,
});

describe("platform go-keys", () => {
  it("number every platform from 0", () => {
    expect(goKeys["0"]).toBe("/");
    expect(goKeys["1"]).toBe("/projects");
    expect(goKeys["2"]).toBe("/work");
    expect(goKeyFor("/resume")).toBe("7");
  });

  it("jump with g then a platform number", () => {
    expect(goSequence("g", 1_000, key("4"), 1_200)).toBe("/about");
    expect(goSequence("g", 1_000, key("p"), 1_200)).toBeUndefined();
  });
});
