import { createSessionScene } from "@/lib/scene/session";

import { bindInput } from "./input";
import { World } from "./world";

/**
 * The lazy scene chunk: one desk for the whole session, drawn as view 0 of
 * the fixed viewport canvas over whichever slot is on the page. z-10 keeps
 * it over the page and under the header (z-20), the drawing frame (z-30)
 * and overlays; the slot's tag, drawers nav, leaders and tilt button sit at
 * z-20 above it. The canvas is its own view-transition group, so the desk
 * stays live through route and theme transitions (styles.css).
 */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 22 },
  bindInput,
  dpr: { 1: 1, 2: [1, 2] },
  // Linework is all 1px edges; without MSAA it breaks up. Phones keep the cap.
  antialias: "wide",
  viewport: { zIndex: 10, transitionName: "scene-canvas" },
});
