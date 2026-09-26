import type { SceneLevel, Theme } from "@/lib/prefs/standard";

import type { ActionItem } from "./items";

export type StandardAction =
  | "copy-email"
  | "resume"
  | "toggle-theme"
  | "toggle-motion"
  | "toggle-sound"
  | "scene-auto"
  | "scene-low"
  | "scene-off";

/** The words an edition puts on its actions; everything else is shared. */
export type ActionCopy = {
  resume: { title: string; subtitle: string };
  /** Theme toggle titles, keyed by what choosing it switches to. */
  toDark: string;
  toLight: string;
  themeSubtitle: string;
  motionSubtitle: string;
  soundSubtitle: string;
  /** "3D press" in "3D press: Auto". */
  sceneName: string;
};

const sceneLabel: Record<SceneLevel, string> = {
  auto: "Auto",
  low: "Low",
  off: "Off",
};

export function resolvedDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** The Actions group for editions on the standard preferences: each title says what choosing it does next. */
export function buildStandardActions(
  copy: ActionCopy,
  {
    email,
    theme,
    motion,
    sound,
    scene,
  }: {
    email?: string;
    theme: Theme;
    motion: boolean;
    sound: boolean;
    scene: SceneLevel;
  }
): ActionItem<StandardAction>[] {
  const actions: ActionItem<StandardAction>[] = [];
  if (email) {
    actions.push({
      id: "action:copy-email",
      title: "Copy email",
      subtitle: email,
      group: "Actions",
      action: "copy-email",
      keywords: ["contact", "mail", "clipboard"],
    });
  }
  actions.push(
    {
      id: "action:resume",
      ...copy.resume,
      group: "Actions",
      action: "resume",
      keywords: ["resume", "cv", "download", "print"],
    },
    {
      id: "action:toggle-theme",
      title: resolvedDark(theme) ? copy.toLight : copy.toDark,
      subtitle: copy.themeSubtitle,
      group: "Actions",
      action: "toggle-theme",
      keywords: ["dark", "light", "theme", "appearance"],
    },
    {
      id: "action:toggle-motion",
      title: motion ? "Turn motion off" : "Turn motion on",
      subtitle: copy.motionSubtitle,
      group: "Actions",
      action: "toggle-motion",
      keywords: ["reduced motion", "animation"],
    },
    {
      id: "action:toggle-sound",
      title: sound ? "Turn sound off" : "Turn sound on",
      subtitle: copy.soundSubtitle,
      group: "Actions",
      action: "toggle-sound",
      keywords: ["audio", "mute"],
    }
  );
  for (const level of ["auto", "low", "off"] as const) {
    actions.push({
      id: `action:scene-${level}`,
      title: `${copy.sceneName}: ${sceneLabel[level]}`,
      group: "Actions",
      action: `scene-${level}`,
      active: scene === level,
      keywords: ["quality", "performance", "webgl", "3d"],
    });
  }
  return actions;
}
