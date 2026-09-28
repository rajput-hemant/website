import { drawGlobe } from "@/flavors/mission/lib/scene/drawing";
import {
  poses,
  VIEW,
  type Board,
  type SceneRoute,
} from "@/flavors/mission/lib/scene/poses";

/**
 * The globe drawn flat, with the scene's own projection: the hidden-line
 * graticule, the limb, one orbit per phase (the active ones in signal red,
 * each with its craft) and the launch site. It is the poster until the
 * canvas is ready, and the whole scene without WebGL, with the 3D
 * preference off, or on low power.
 */
export function ScenePoster({
  route,
  board,
}: {
  route: SceneRoute;
  board: Board;
}) {
  const drawing = drawGlobe(board, poses[route]);
  const v = VIEW;
  return (
    <svg
      viewBox={`${-v} ${-v} ${v * 2} ${v * 2}`}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className="globe block size-full"
    >
      <g vectorEffect="non-scaling-stroke" strokeWidth="1">
        <path
          className="gr"
          d={drawing.graticule}
          vectorEffect="non-scaling-stroke"
        />
        <circle className="lb" r="1" vectorEffect="non-scaling-stroke" />
        {drawing.orbits.map((orbit, i) => (
          <path
            key={i}
            className={orbit.lit ? "ob on" : "ob"}
            d={orbit.d}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {drawing.orbits.map((orbit, i) =>
        orbit.craft ? (
          <rect
            key={i}
            className="st"
            x={orbit.craft[0] - 0.035}
            y={orbit.craft[1] - 0.035}
            width="0.07"
            height="0.07"
            transform={`rotate(45 ${orbit.craft[0]} ${orbit.craft[1]})`}
          />
        ) : null
      )}
      {drawing.site ? (
        <g className="st">
          <circle cx={drawing.site[0]} cy={drawing.site[1]} r="0.024" />
          <circle
            cx={drawing.site[0]}
            cy={drawing.site[1]}
            r="0.065"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ) : null}
    </svg>
  );
}
