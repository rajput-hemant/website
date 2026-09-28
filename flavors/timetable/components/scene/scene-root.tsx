import { createSessionScene } from "@/lib/scene/session";

import { bindInput } from "./input";
import { views } from "./views";
import { World } from "./world";

/**
 * The lazy scene chunk: one indicator for the whole session, drawn as view 0
 * of the fixed viewport canvas over whichever slot is on the page, plus the
 * page's own objects (`views/`) in their placeholders. z-10 keeps
 * it over the page and under the dock and tilt button (z-20),
 * the sign band (z-30) and overlays.
 */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 26, position: [0, 0, 12] },
  bindInput,
  viewport: { zIndex: 10, views },
});
