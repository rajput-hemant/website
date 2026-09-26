import type { SceneLevel, Theme } from "@/flavors/survey/lib/prefs";

import {
  filter,
  isAction,
  keywordsFor,
  type ActionItem as SharedActionItem,
  type Item as SharedItem,
} from "@/lib/command/items";

export type Action =
  | "copy-email"
  | "resume"
  | "toggle-theme"
  | "toggle-motion"
  | "toggle-sound"
  | "scene-auto"
  | "scene-low"
  | "scene-off";

export type ActionItem = SharedActionItem<Action>;
export type Item = SharedItem<Action>;

export { filter, isAction, keywordsFor };

const sceneLabel: Record<SceneLevel, string> = {
  auto: "Auto",
  low: "Low",
  off: "Off",
};

function resolvedDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** The Actions group: each label says what choosing it does next. */
export function buildActions({
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
}): ActionItem[] {
  const actions: ActionItem[] = [];
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
      title: "Open the printed sheet",
      subtitle: "Printable resume",
      group: "Actions",
      action: "resume",
      keywords: ["resume", "cv", "download", "print"],
    },
    {
      id: "action:toggle-theme",
      title: resolvedDark(theme)
        ? "Switch to the day sheet"
        : "Switch to the night chart",
      subtitle: "Light or dark theme",
      group: "Actions",
      action: "toggle-theme",
      keywords: ["dark", "light", "theme", "appearance"],
    },
    {
      id: "action:toggle-motion",
      title: motion ? "Turn motion off" : "Turn motion on",
      subtitle: "The loupe, contour drawing and camera flights",
      group: "Actions",
      action: "toggle-motion",
      keywords: ["reduced motion", "animation"],
    },
    {
      id: "action:toggle-sound",
      title: sound ? "Turn sound off" : "Turn sound on",
      subtitle: "Click sounds",
      group: "Actions",
      action: "toggle-sound",
      keywords: ["audio", "mute"],
    }
  );
  for (const level of ["auto", "low", "off"] as const satisfies SceneLevel[]) {
    actions.push({
      id: `action:scene-${level}`,
      title: `3D relief: ${sceneLabel[level]}`,
      group: "Actions",
      action: `scene-${level}`,
      active: scene === level,
      keywords: ["quality", "performance", "webgl", "3d", "terrain"],
    });
  }
  return actions;
}
