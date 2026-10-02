import { kick, motionOn } from "@/lib/scene/clock";
import { sceneInspect } from "@/lib/scene/inspect";
import {
  bindDragInput,
  createSessionScene,
  type DragBounds,
} from "@/lib/scene/session";

import { World } from "./world";

/** Turning and zooming the tray (`lib/scene/inspect.ts`), all the way round. */
const turn = sceneInspect({
  pitch: [-0.9, 0.9],
  zoom: [0.8, 1.8],
  reducedMotion: () => !motionOn(),
  onWake: () => kick(),
});

/** Hover and the slosh's side only: the turning belongs to the inspect. */
const HOVER: DragBounds = { x: [-160, 160], y: [0, 0] };

/** The lazy scene chunk: one developer tray for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World inspect={turn.frame} />,
  camera: { fov: 30, position: [0, 5.8, 2.1] },
  bindInput: (host) => {
    const offHover = bindDragInput(host, HOVER);
    const offTurn = turn.bindInput(host);
    return () => {
      offTurn();
      offHover();
    };
  },
});
