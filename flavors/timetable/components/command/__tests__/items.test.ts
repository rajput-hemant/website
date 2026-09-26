import { describe, expect, it } from "vitest";

import { buildActions } from "../items";

const base = {
  theme: "light",
  motion: true,
  sound: false,
  scene: "auto",
} as const;

describe("buildActions", () => {
  it("offers copy email only when there is an address", () => {
    expect(buildActions(base).some((a) => a.action === "copy-email")).toBe(
      false
    );
    expect(buildActions({ ...base, email: "a@b.c" })[0]?.action).toBe(
      "copy-email"
    );
  });

  it("labels toggles by what they do next", () => {
    const titles = buildActions({ ...base, theme: "dark", motion: false }).map(
      (a) => a.title
    );
    expect(titles).toContain("Switch to day");
    expect(titles).toContain("Turn motion on");
  });

  it("marks the current scene level", () => {
    const active = buildActions({ ...base, scene: "low" }).filter(
      (a) => a.active
    );
    expect(active.map((a) => a.action)).toEqual(["scene-low"]);
  });
});
