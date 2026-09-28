import type { SceneLevel, Theme } from "@/flavors/mission/lib/prefs";

import type { ActionItem } from "@/lib/command/items";
import {
  buildStandardActions,
  type StandardAction,
} from "@/lib/command/standard-actions";

import { actionCopy } from "./copy";

export type Action = StandardAction;

/** The Actions group in this edition's words: each title says what choosing it does next. */
export function buildActions(state: {
  email?: string | undefined;
  theme: Theme;
  motion: boolean;
  sound: boolean;
  scene: SceneLevel;
}): ActionItem<Action>[] {
  return buildStandardActions(actionCopy, state);
}
