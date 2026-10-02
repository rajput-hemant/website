import { kick, motionOn } from "@/lib/scene/clock";
import { sceneInspect } from "@/lib/scene/inspect";
import {
  bindDragInput,
  createSessionScene,
  type DragBounds,
} from "@/lib/scene/session";

import { World } from "./world";

/** Turning and zooming the site model (`lib/scene/inspect.ts`), all the way round. */
const turn = sceneInspect({
  pitch: [-0.5, 0.5],
  zoom: [0.8, 1.8],
  reducedMotion: () => !motionOn(),
  onWake: () => kick(),
});

/** Hover only: the drag belongs to the inspect. */
const HOVER: DragBounds = { x: [0, 0], y: [0, 0] };

/** The lazy scene chunk: one site model for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World inspect={turn.frame} />,
  camera: { fov: 26, position: [0, 6, 10] },
  bindInput: (host) => {
    const offHover = bindDragInput(host, HOVER);
    const offTurn = turn.bindInput(host);
    return () => {
      offTurn();
      offHover();
    };
  },
});
