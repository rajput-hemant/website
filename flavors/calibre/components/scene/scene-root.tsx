import { kick, motionOn } from "@/lib/scene/clock";
import { sceneInspect } from "@/lib/scene/inspect";
import {
  bindDragInput,
  createSessionScene,
  type DragBounds,
} from "@/lib/scene/session";

import { World } from "./world";

/**
 * Turning and zooming the movement (`lib/scene/inspect.ts`): pitch stops a
 * little past edge on, so the plate never flips over the bezel's prints.
 */
const turn = sceneInspect({
  pitch: [-1.3, 1.3],
  zoom: [0.8, 1.8],
  reducedMotion: () => !motionOn(),
  onWake: () => kick(),
});

/** Hover only: the drag belongs to the inspect. */
const HOVER: DragBounds = { x: [0, 0], y: [0, 0] };

/** The lazy scene chunk: one movement for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World inspect={turn.frame} />,
  camera: { fov: 30, position: [0, 0, 4.2] },
  bindInput: (host) => {
    const offHover = bindDragInput(host, HOVER);
    const offTurn = turn.bindInput(host);
    return () => {
      offTurn();
      offHover();
    };
  },
});
