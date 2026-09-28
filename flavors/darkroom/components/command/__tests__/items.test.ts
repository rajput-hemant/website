import { actionCopy } from "@/flavors/darkroom/components/command/copy";
import { describe, expect, it } from "vitest";

import { buildStandardActions } from "@/lib/command/standard-actions";

const build = (patch: Partial<Parameters<typeof buildStandardActions>[1]>) =>
  buildStandardActions(actionCopy, {
    email: "hello@example.com",
    theme: "dark",
    motion: true,
    sound: false,
    scene: "auto",
    ...patch,
  });

describe("darkroom command actions", () => {
  it("names the theme toggle after where it takes you", () => {
    const toggle = (theme: "dark" | "light") =>
      build({ theme }).find((a) => a.action === "toggle-theme")?.title;
    expect(toggle("dark")).toBe("Switch to the light table");
    expect(toggle("light")).toBe("Switch to the safelight");
  });

  it("offers sound on while it is off, and the tray's quality levels", () => {
    const actions = build({});
    expect(actions.find((a) => a.action === "toggle-sound")?.title).toBe(
      "Turn sound on"
    );
    expect(
      actions.filter((a) => a.action.startsWith("scene-")).map((a) => a.title)
    ).toEqual(["3D tray: Auto", "3D tray: Low", "3D tray: Off"]);
    expect(actions.find((a) => a.action === "scene-auto")?.active).toBe(true);
  });

  it("drops copy email without an address", () => {
    expect(
      build({ email: undefined }).some((a) => a.action === "copy-email")
    ).toBe(false);
    expect(build({})[0]?.action).toBe("copy-email");
  });

  it("pulls the resume as the fibre print", () => {
    expect(build({}).find((a) => a.action === "resume")?.title).toBe(
      "Pull the fibre print"
    );
  });
});
