import { glyphViews } from "@/flavors/minimal/lib/scene/glyphs";

import { createSessionScene, type SceneViews } from "@/lib/scene/session";

import { renderGlyph } from "./glyphs";
import { ViewAnchor } from "./kit";
import { World } from "./world";

/** Views that keep their poster until they have drawn something of their own. */
const selfReady = new Set<string>(["fieldlite"]);

const views: SceneViews = Object.fromEntries(
  Object.entries(glyphViews).map(([id, kind]) => [
    id,
    () => (
      <ViewAnchor id={id} selfReady={selfReady.has(id)}>
        {renderGlyph(kind)}
      </ViewAnchor>
    ),
  ])
);

/**
 * The lazy scene chunk: one fixed canvas for the session, the lead glyph as
 * view 0 and every placeholder on the page as another view. z-5 keeps it
 * over the page's own fills (row hovers, poster frames, the timeline rail)
 * and under the chrome: the header (z-40), popovers and dialogs (z-50).
 * Pointer input is each glyph's own, on its element.
 */
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 30, position: [0, 0, 10] },
  bindInput: () => () => {},
  viewport: { zIndex: 5, views },
});
