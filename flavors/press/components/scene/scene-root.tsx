import { createSessionScene } from "@/lib/scene/session";

import { World } from "./world";

/** The lazy scene chunk: one press for the whole session, lent to each slot. */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 30, position: [2.4, 3.1, 6.2] },
  drag: { x: [-260, 260], y: [-160, 160] },
  clipping: true,
});
