import type { ActionCopy } from "@/lib/command/standard-actions";

/** What this edition's actions say. */
export const actionCopy: ActionCopy = {
  resume: { title: "Pull the fibre print", subtitle: "Printable resume" },
  toDark: "Switch to the safelight",
  toLight: "Switch to the light table",
  themeSubtitle: "Prints under the safelight, negatives on the light table",
  motionSubtitle: "Prints developing, ripples in the tray, the pencil",
  soundSubtitle: "Timer, tongs, relay and paper",
  sceneName: "3D tray",
  sceneKeywords: ["developer", "tray"],
};
