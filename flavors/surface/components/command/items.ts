import type { SceneLevel, Theme } from "@/flavors/surface/lib/prefs";

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

/**
 * The Actions group: copy email (needs the index), the printable resume, and
 * toggles/pickers that read the live preference so a label always says what
 * selecting it does next.
 */
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
  const dark = resolvedDark(theme);

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
      title: "Open resume",
      subtitle: "Printable resume",
      group: "Actions",
      action: "resume",
      keywords: ["cv", "download", "print"],
    },
    {
      id: "action:toggle-theme",
      title: dark
        ? "Switch to the grey edition"
        : "Switch to the black edition",
      group: "Actions",
      action: "toggle-theme",
      keywords: ["dark", "light", "theme", "black", "grey", "appearance"],
    },
    {
      id: "action:toggle-motion",
      title: motion ? "Turn motion off" : "Turn motion on",
      subtitle: "Knob springs, lamps and page fades",
      group: "Actions",
      action: "toggle-motion",
      keywords: ["reduced motion", "animation"],
    },
    {
      id: "action:toggle-sound",
      title: sound ? "Turn detent clicks off" : "Turn detent clicks on",
      subtitle: "A click at every knob detent",
      group: "Actions",
      action: "toggle-sound",
      keywords: ["audio", "mute", "sound"],
    }
  );
  for (const level of ["auto", "low", "off"] as const satisfies SceneLevel[]) {
    actions.push({
      id: `action:scene-${level}`,
      title: `3D knob: ${sceneLabel[level]}`,
      group: "Actions",
      action: `scene-${level}`,
      active: scene === level,
      keywords: ["quality", "performance", "webgl", "3d", "scene"],
    });
  }
  return actions;
}
