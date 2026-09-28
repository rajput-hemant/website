import { createSessionScene } from "@/lib/scene/session";

import { World } from "./world";

/** The lazy scene chunk: one site model for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 26, position: [0, 6, 10] },
  drag: { x: [-220, 220], y: [-140, 140] },
});
