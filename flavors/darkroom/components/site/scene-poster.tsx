import { poses, type SceneRoute } from "@/flavors/darkroom/lib/scene/poses";
import {
  composePrint,
  parseBoard,
  PRINT_H,
  PRINT_W,
} from "@/flavors/darkroom/lib/scene/prints";

import { PrintSvg } from "./print-svg";

/** Where the print lies in the poster's 640 by 460 drawing. */
const PRINT_X = 110;
const PRINT_Y = 96;
const PRINT_SCALE = 0.42;

/**
 * The developer tray drawn flat, seen from above: the print that lies in
 * it for this page. It is the poster until the canvas is ready, and the
 * whole scene without WebGL, with the scene off, or on low power.
 */
export function ScenePoster({
  route,
  board,
}: {
  route: SceneRoute;
  board: string | null;
}) {
  const shapes = composePrint(poses[route].print, parseBoard(board));
  return (
    <svg
      viewBox="0 0 640 460"
      aria-hidden
      focusable="false"
      className="block h-full w-full"
    >
      <path className="fill-scene-tray" d="M52 34H588L616 438H24Z" />
      <path className="fill-strip opacity-40" d="M70 52H570L594 420H46Z" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          className="fill-scene-tray opacity-60"
          x={60 + i * 2}
          y={120 + i * 88}
          width={520 - i * 4}
          height={6}
        />
      ))}
      <g transform={`translate(${PRINT_X} ${PRINT_Y}) scale(${PRINT_SCALE})`}>
        <rect className="fill-scene-paper" width={PRINT_W} height={PRINT_H} />
        <PrintSvg shapes={shapes} />
      </g>
    </svg>
  );
}
