import { kick, motionOn } from "@/lib/scene/clock";
import { sceneInspect } from "@/lib/scene/inspect";
import { createSessionScene } from "@/lib/scene/session";

import { bindInput } from "./input";
import { views } from "./views";
import { World } from "./world";

/**
 * Turning and zooming the desk (`lib/scene/inspect.ts`): the eye orbits it all
 * the way round, tips a little either way and moves in or out.
 */
const turn = sceneInspect({
  pitch: [-0.6, 0.6],
  zoom: [0.8, 1.8],
  reducedMotion: () => !motionOn(),
  onWake: () => kick(),
});

/**
 * The lazy scene chunk: one desk for the whole session, drawn as view 0 of
 * the fixed viewport canvas over whichever slot is on the page. z-10 keeps
 * it over the page and under the header (z-20), the drawing frame (z-30)
 * and overlays; the slot's tag, drawers nav, leaders and tilt button sit at
 * z-20 above it. The canvas is its own view-transition group, so the desk
 * stays live through route and theme transitions (styles.css). `views`
 * draws the page's other tracked placeholders (views/index.tsx).
 */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World turn={turn} />,
  camera: { fov: 22 },
  bindInput: (host) => {
    const offHover = bindInput(host);
    const offTurn = turn.bindInput(host);
    return () => {
      offTurn();
      offHover();
    };
  },
  dpr: { 1: 1, 2: [1, 2] },
  // Linework is all 1px edges; without MSAA it breaks up. Phones keep the cap.
  antialias: "wide",
  viewport: { zIndex: 10, transitionName: "scene-canvas", views },
});
