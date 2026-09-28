import { createSessionScene } from "@/lib/scene/session";

import { World } from "./world";

/** The lazy scene chunk: one developer tray for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 30, position: [0, 5.8, 2.1] },
  drag: { x: [-160, 160], y: [-110, 110] },
});
