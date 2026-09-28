import {
  JewelTags,
  type Tag,
} from "@/flavors/calibre/components/jewels/jewel-tags";
import { LazySceneLoader } from "@/flavors/calibre/components/scene/lazy-scene-loader";
import type { SceneRoute } from "@/flavors/calibre/lib/scene/poses";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute, Tag };

/**
 * The movement behind the caseback: the drawn poster plus the loader, which
 * lends the session's one canvas to this slot and fades the poster once a
 * frame is on screen. `board` carries the jewel count and the lit jewel
 * (`encodeBoard`), so the poster and the scene show the same movement. It
 * fills the bezel's round window, so its box is fixed and CLS stays 0.
 * `tags` name each jewel's project over the movement, in HTML.
 */
export function SceneSlot({
  route,
  board,
  tags = [],
}: {
  route: SceneRoute;
  board: string;
  tags?: readonly Tag[];
}) {
  return (
    <div
      data-scene-slot
      data-scene-route={route}
      data-scene-board={board}
      style={{ viewTransitionName: "scene" }}
      className="absolute inset-0"
    >
      <div
        data-scene-poster
        aria-hidden
        className="absolute inset-0 transition-opacity duration-(--duration-ui)"
      >
        <ScenePoster board={board} />
      </div>
      <LazySceneLoader route={route} />
      {tags.length > 0 ? <JewelTags board={board} tags={tags} /> : null}
    </div>
  );
}
