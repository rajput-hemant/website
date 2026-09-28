import {
  goKeyFor,
  goKeys,
  goSequence,
} from "@/flavors/darkroom/components/command/shortcuts";
import { describe, expect, it } from "vitest";

describe("darkroom go keys", () => {
  it("jumps by the frame numbers printed in the nav, and h for home", () => {
    expect(goKeys).toEqual({
      h: "/",
      "1": "/projects",
      "2": "/work",
      "3": "/lab",
      "4": "/about",
      "5": "/now",
      "6": "/ask",
      "7": "/resume",
    });
    expect(goKeyFor("/about")).toBe("4");
  });

  it("jumps from the menu's field only right after a lone g", () => {
    const key = {
      key: "2",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      isComposing: false,
    };
    expect(goSequence("g", 1000, key, 1500)).toBe("/work");
    expect(goSequence("g", 1000, key, 3000)).toBeUndefined();
    expect(goSequence("go", 1000, key, 1500)).toBeUndefined();
  });
});
