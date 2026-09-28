/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";

import { fixedContainingBlockAncestor } from "../fixed-containing-block";

describe("fixedContainingBlockAncestor", () => {
  test("detects a transformed ancestor", () => {
    const root = document.createElement("div");
    root.style.transform = "translateX(4px)";
    const child = document.createElement("span");
    root.append(child);
    document.body.append(root);
    expect(fixedContainingBlockAncestor(child)).toBe(root);
    root.remove();
  });

  test("returns null up to body when no containing block", () => {
    const el = document.createElement("span");
    document.body.append(el);
    expect(fixedContainingBlockAncestor(el)).toBeNull();
    el.remove();
  });
});
