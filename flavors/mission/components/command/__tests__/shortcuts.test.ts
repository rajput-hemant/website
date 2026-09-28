import {
  goKeyFor,
  goKeys,
  goSequence,
} from "@/flavors/mission/components/command/shortcuts";
import { sections } from "@/flavors/mission/content";
import { describe, expect, it } from "vitest";

const key = (k: string) => ({
  key: k,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  isComposing: false,
});

describe("mission go keys", () => {
  it("gives every section a letter", () => {
    expect(goKeys.h).toBe("/");
    expect(goKeys.p).toBe("/projects");
    expect(goKeys.e).toBe("/work");
    expect(goKeys.q).toBe("/ask");
    expect(goKeyFor("/resume")).toBe("r");
    expect(Object.keys(goKeys)).toHaveLength(sections.length);
  });

  it("jumps from the menu only right after a lone g", () => {
    expect(goSequence("g", 1000, key("a"), 1500)).toBe("/about");
    expect(goSequence("g", 1000, key("a"), 3000)).toBeUndefined();
    expect(goSequence("go", 1000, key("a"), 1500)).toBeUndefined();
  });
});
