import type { SceneViewId } from "@/flavors/timetable/components/site/scene-view";

import type { SceneViews } from "@/lib/scene/session";

import { createCounter, createSignalHead } from "./board";
import { sceneView } from "./kit";
import { createTotem, createTrain } from "./map";
import { createRoundel } from "./roundel";
import { createStationClock } from "./station";

/** Every in-page view, by its placeholder's `data-scene-view` id. */
export const views = {
  totem: sceneView("totem", createTotem),
  clock: sceneView("clock", createStationClock),
  counter: sceneView("counter", createCounter),
  signal: sceneView("signal", createSignalHead),
  roundel: sceneView("roundel", createRoundel),
  train: sceneView("train", createTrain),
} satisfies Partial<Record<SceneViewId, SceneViews[string]>>;
