import type { SceneLevel, Theme } from "@/flavors/drawing-set/lib/prefs";
import { defaultFilter } from "cmdk";

import type { SearchEntry } from "@/lib/command/types";

export type Action =
  | "copy-email"
  | "resume"
  | "toggle-theme"
  | "toggle-motion"
  | "toggle-sound"
  | "scene-auto"
  | "scene-low"
  | "scene-off";

/** A menu row that runs something instead of navigating. */
export type ActionItem = {
  id: string;
  title: string;
  subtitle?: string;
  group: "Actions";
  keywords: string[];
  action: Action;
  /** The option matching the current preference: shown with a check instead of the row's icon. */
  active?: boolean;
};

export type Item = SearchEntry | ActionItem;

export const isAction = (item: Item): item is ActionItem => "action" in item;

/** cmdk's title scores below this are letters scattered across a long title. */
const MIN_TITLE_SCORE = 0.16;
/** A literal hit in a subtitle or keyword ranks under a good title match. */
const KEYWORD_SCORE = 0.4;

/** What cmdk matches an item against, title first so `filter` can score it on its own. */
export function keywordsFor(item: Item): string[] {
  return [item.title, item.subtitle ?? "", item.group, ...item.keywords];
}

/**
 * cmdk's fuzzy score on the title (the first keyword), or a flat score when
 * every word of the query appears verbatim in the rest. Fuzzy-matching the
 * long subtitle and keyword text would match almost any short query.
 */
export function filter(
  value: string,
  search: string,
  keywords: string[] = []
): number {
  const [title = value, ...rest] = keywords;
  const titleScore = defaultFilter(title, search);
  if (titleScore >= MIN_TITLE_SCORE) return titleScore;
  const haystack = rest.join(" ").toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => haystack.includes(word))
    ? KEYWORD_SCORE
    : 0;
}

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
      title: dark ? "Switch to light theme" : "Switch to dark theme",
      group: "Actions",
      action: "toggle-theme",
      keywords: ["dark", "light", "appearance"],
    },
    {
      id: "action:toggle-motion",
      title: motion ? "Turn motion off" : "Turn motion on",
      subtitle: "Reveals, transitions and camera moves",
      group: "Actions",
      action: "toggle-motion",
      keywords: ["reduced motion", "animation"],
    },
    {
      id: "action:toggle-sound",
      title: sound ? "Turn sound off" : "Turn sound on",
      subtitle: "Click and drawer sounds",
      group: "Actions",
      action: "toggle-sound",
      keywords: ["audio", "mute"],
    }
  );
  for (const level of ["auto", "low", "off"] as const satisfies SceneLevel[]) {
    actions.push({
      id: `action:scene-${level}`,
      title: `3D scene quality: ${sceneLabel[level]}`,
      group: "Actions",
      action: `scene-${level}`,
      active: scene === level,
      keywords: ["quality", "performance", "webgl", "3d"],
    });
  }
  return actions;
}
