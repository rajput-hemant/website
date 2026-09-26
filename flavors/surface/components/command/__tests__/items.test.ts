import { describe, expect, it } from "vitest";

import { buildActions } from "../items";

describe("buildActions", () => {
  const base = {
    theme: "dark",
    motion: true,
    sound: false,
    scene: "auto",
  } as const;

  it("adds copy email only when the index carries an address", () => {
    expect(buildActions(base).map((a) => a.action)).toEqual([
      "resume",
      "toggle-theme",
      "toggle-motion",
      "toggle-sound",
      "scene-auto",
      "scene-low",
      "scene-off",
    ]);
    expect(
      buildActions({ ...base, email: "a@b.c" }).map((a) => a.action)
    ).toEqual([
      "copy-email",
      "resume",
      "toggle-theme",
      "toggle-motion",
      "toggle-sound",
      "scene-auto",
      "scene-low",
      "scene-off",
    ]);
  });

  it("marks the scene action matching the current preference as active", () => {
    const actions = buildActions({ ...base, scene: "low" });
    const byAction = new Map(actions.map((a) => [a.action, a.active]));
    expect(byAction.get("scene-auto")).toBeFalsy();
    expect(byAction.get("scene-low")).toBe(true);
    expect(byAction.get("scene-off")).toBeFalsy();
  });

  it("phrases the theme toggle after the resolved theme", () => {
    const [, dark] = buildActions({ ...base, theme: "dark" });
    const [, light] = buildActions({ ...base, theme: "light" });
    expect(dark?.title).toBe("Switch to the grey edition");
    expect(light?.title).toBe("Switch to the black edition");
  });
});
