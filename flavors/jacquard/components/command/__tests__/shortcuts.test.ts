import {
  goKeyFor,
  goKeys,
  goSequence,
} from "@/flavors/jacquard/components/command/shortcuts";
import { cards } from "@/flavors/jacquard/content";
import { describe, expect, it } from "vitest";

const key = (k: string) => ({
  key: k,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  isComposing: false,
});

describe("jacquard go keys", () => {
  it("gives every card in the chain a letter", () => {
    expect(goKeys.h).toBe("/");
    expect(goKeys.p).toBe("/projects");
    expect(goKeys.e).toBe("/work");
    expect(goKeys.q).toBe("/ask");
    expect(goKeyFor("/resume")).toBe("r");
    expect(Object.keys(goKeys)).toHaveLength(cards.length);
  });

  it("jumps from the menu only right after a lone g", () => {
    expect(goSequence("g", 1000, key("a"), 1500)).toBe("/about");
    expect(goSequence("g", 1000, key("a"), 3000)).toBeUndefined();
    expect(goSequence("go", 1000, key("a"), 1500)).toBeUndefined();
  });
});
