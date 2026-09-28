import { buildActions } from "@/flavors/mission/components/command/items";
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

  it("labels toggles in the flight plan's words, by what they do next", () => {
    const titles = buildActions({
      ...base,
      theme: "dark",
      motion: false,
      sound: true,
    }).map((a) => a.title);
    expect(titles).toContain("Switch to paper");
    expect(titles).toContain("Turn motion on");
    expect(titles).toContain("Turn sound off");
    expect(titles).toContain("Print the crew record");
  });

  it("marks the current 3D globe level", () => {
    const active = buildActions({ ...base, scene: "low" }).filter(
      (a) => a.active
    );
    expect(active.map((a) => a.title)).toEqual(["3D globe: Low"]);
  });
});
