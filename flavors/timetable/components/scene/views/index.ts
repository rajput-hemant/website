import type { SceneViewId } from "@/flavors/timetable/components/site/scene-view";

import type { SceneViews } from "@/lib/scene/session";

import { createPosts, createPylon } from "./about";
import { createInfoSign, createValidator } from "./ask";
import { createCounter, createSignalHead } from "./board";
import { sceneView } from "./kit";
import { createTotem, createTrain } from "./map";
import { createYearDrum } from "./now";
import { createBogie, createTicket } from "./project";
import { createRoundel } from "./roundel";
import { createStationClock } from "./station";
import {
  createBufferStop,
  createLevers,
  createPrinter,
  createTurntable,
} from "./yard";

/** Every in-page view, by its placeholder's `data-scene-view` id. */
export const views = {
  totem: sceneView("totem", createTotem),
  clock: sceneView("clock", createStationClock),
  counter: sceneView("counter", createCounter),
  signal: sceneView("signal", createSignalHead),
  roundel: sceneView("roundel", createRoundel),
  train: sceneView("train", createTrain),
  ticket: sceneView("ticket", createTicket),
  bogie: sceneView("bogie", createBogie),
  pylon: sceneView("pylon", createPylon),
  posts: sceneView("posts", createPosts),
  drum: sceneView("drum", createYearDrum),
  info: sceneView("info", createInfoSign),
  validator: sceneView("validator", createValidator),
  turntable: sceneView("turntable", createTurntable),
  printer: sceneView("printer", createPrinter),
  levers: sceneView("levers", createLevers),
  buffer: sceneView("buffer", createBufferStop),
} satisfies Record<SceneViewId, SceneViews[string]>;
