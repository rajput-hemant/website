import { describe, expect, it } from "vitest";

import { buildStandardActions, type ActionCopy } from "../standard-actions";

const copy: ActionCopy = {
  resume: { title: "Open the resume", subtitle: "Printable" },
  toDark: "Go dark",
  toLight: "Go light",
  themeSubtitle: "Theme",
  motionSubtitle: "Motion",
  soundSubtitle: "Sound",
  sceneName: "3D",
};

const state = {
  theme: "light",
  motion: true,
  sound: false,
  scene: "low",
} as const;

describe("buildStandardActions", () => {
  it("offers copy email only when the email is known", () => {
    const ids = (email?: string) =>
      buildStandardActions(copy, { ...state, email }).map((a) => a.id);
    expect(ids()).not.toContain("action:copy-email");
    expect(ids("a@b.c")[0]).toBe("action:copy-email");
  });

  it("names what each toggle does next and checks the current scene level", () => {
    const actions = buildStandardActions(copy, state);
    const title = (id: string) => actions.find((a) => a.id === id)?.title;
    expect(title("action:toggle-theme")).toBe("Go dark");
    expect(title("action:toggle-motion")).toBe("Turn motion off");
    expect(title("action:toggle-sound")).toBe("Turn sound on");
    expect(actions.filter((a) => a.active).map((a) => a.id)).toEqual([
      "action:scene-low",
    ]);
  });
});
