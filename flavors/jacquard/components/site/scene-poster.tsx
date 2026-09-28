import {
  cellAt,
  poses,
  type SceneRoute,
  type Weave,
} from "@/flavors/jacquard/lib/scene/poses";

/** Loom-state colours: greige weft, charcoal warp, the madder label. */
const WEFT = "#cdccc4";
const WARP = "#2b2e33";
const LABEL = "#b8393f";

/** The raised cells of one repeat, as one path in cell units. */
function raisedPath(weave: Weave) {
  let d = "";
  for (let y = 0; y < weave.h; y++) {
    for (let x = 0; x < weave.w; x++) {
      if (cellAt(weave, x, y) >= 0) d += `M${x + 0.12} ${y}h.76v1h-.76z`;
    }
  }
  return d;
}

const CLOTH =
  "M110 40H290V430Q267 444 245 432Q222 446 200 432Q177 446 155 432Q132 446 110 432Z";

/**
 * The cloth drawn flat: loom-state cloth hanging from its rod, woven from
 * this page's weave, with the pleats as light and shade and the sewn label.
 * It is the poster until the canvas is ready, and the whole scene without
 * WebGL, with the 3D preference off, or on low power.
 */
export function ScenePoster({
  route,
  weave,
}: {
  route: SceneRoute;
  weave: Weave;
}) {
  const pose = poses[route];
  const tileW = 180 / pose.repeat[0];
  const tileH = 392 / pose.repeat[1];
  const id = `jq-poster-${route}`;
  return (
    <svg
      viewBox="0 0 400 480"
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className="block size-full"
    >
      <defs>
        <pattern
          id={`${id}-weave`}
          width={tileW}
          height={tileH}
          x="110"
          y="40"
          patternUnits="userSpaceOnUse"
        >
          <g transform={`scale(${tileW / weave.w} ${tileH / weave.h})`}>
            <rect width={weave.w} height={weave.h} fill={WEFT} />
            <path fill={WARP} d={raisedPath(weave)} />
          </g>
        </pattern>
        <linearGradient id={`${id}-pleat`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".22" />
          <stop offset=".22" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".45" stopColor="#000" stopOpacity=".18" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path d={CLOTH} fill={`url(#${id}-weave)`} />
      {pose.broken ? (
        <g>
          <rect x="226" y="40" width="7" height="400" className="fill-ground" />
          <path
            d="M229.5 40V250Q236 300 224 350"
            fill="none"
            stroke={WARP}
            strokeWidth="1.4"
          />
        </g>
      ) : null}
      <path d={CLOTH} fill={`url(#${id}-pleat)`} />
      <rect x="222" y="392" width="54" height="16" fill={LABEL} />
      <rect
        x="224.5"
        y="394.5"
        width="49"
        height="11"
        fill="none"
        stroke="rgb(255 238 228 / .55)"
        strokeDasharray="2 1.6"
        strokeWidth=".7"
      />
      <line
        x1="80"
        y1="38"
        x2="320"
        y2="38"
        stroke="#2a2d32"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
