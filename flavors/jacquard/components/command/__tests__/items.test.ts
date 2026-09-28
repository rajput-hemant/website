import { buildActions } from "@/flavors/jacquard/components/command/items";
import { describe, expect, it } from "vitest";

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

  it("labels toggles in the loom's words, by what they do next", () => {
    const titles = buildActions({
      ...base,
      theme: "dark",
      motion: false,
      sound: true,
    }).map((a) => a.title);
    expect(titles).toContain("Switch to the day loom");
    expect(titles).toContain("Turn motion on");
    expect(titles).toContain("Turn sound off");
    expect(titles).toContain("Take the pattern card");
  });

  it("marks the current 3D cloth level", () => {
    const active = buildActions({ ...base, scene: "low" }).filter(
      (a) => a.active
    );
    expect(active.map((a) => a.title)).toEqual(["3D cloth: Low"]);
  });
});
