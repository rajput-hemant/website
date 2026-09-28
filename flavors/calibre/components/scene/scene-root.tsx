import { createSessionScene } from "@/lib/scene/session";

import { World } from "./world";

/** The lazy scene chunk: one movement for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 30, position: [0, 0, 4.2] },
  drag: { x: [-220, 220], y: [-100, 100] },
});
