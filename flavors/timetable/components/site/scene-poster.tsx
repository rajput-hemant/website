import {
  composeBoard,
  composeMini,
  OWNER_ON_BOARD,
} from "@/flavors/timetable/lib/board";
import {
  EXTRAS,
  HOUSING,
  MINI_H,
  MODULE_GAP,
  MODULE_ROWS,
  poseFrame,
  poses,
  type Extra,
  type SceneRoute,
} from "@/flavors/timetable/lib/scene/poses";

/** The poster's frame is 420px of scene across, like the scene camera's. */
const FRAME_W = 420;

/**
 * The indicator as a static drawing: the poster before WebGL is ready, and
 * the permanent fallback without it. It reads the same board as the scene.
 */
export function ScenePoster({
  route,
  board,
}: {
  route: SceneRoute;
  board?: string | undefined;
}) {
  const pose = poses[route];
  const { rows, yellowFrom, yellowRow } = (
    pose.mini ? composeMini : composeBoard
  )(board ?? pose.board);
  const frame = poseFrame(pose);
  // Scene units to poster px, and where the housing's left edge lands.
  const S = FRAME_W / frame.size[0];
  const left = 240 - (HOUSING.W / 2 + frame.center[0]) * S;
  const faceW = HOUSING.W * S;
  const faceH = (pose.mini ? MINI_H : HOUSING.H) * S;
  const height = pose.mini ? 210 : 330;
  const top = pose.mini ? 60 : 96;
  const rodX = HOUSING.rodX * S;
  const right = pose.yaw < 0;
  const cx = faceW / 2;
  const rowsShown = pose.mini ? MODULE_ROWS.slice(0, 1) : MODULE_ROWS;
  return (
    <svg
      viewBox={`0 0 480 ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="size-full"
    >
      <g className="stroke-ink" strokeWidth="2">
        <line
          x1={left + cx - rodX}
          y1="0"
          x2={left + cx - rodX}
          y2={top + (right ? 6 : -6)}
        />
        <line
          x1={left + cx + rodX}
          y1="0"
          x2={left + cx + rodX}
          y2={top + (right ? -6 : 6)}
        />
      </g>
      <g
        transform={`translate(${left} ${top}) ${right ? "matrix(1 -0.03 0 1 0 6)" : "matrix(1 0.03 0 1 0 -6)"}`}
      >
        <rect
          x={right ? faceW : -14}
          y="4"
          width="14"
          height={faceH}
          fill="#0c0f12"
        />
        <rect width={faceW} height={faceH} rx="4" fill="#1b2025" />
        <g
          fill="#9aa4ad"
          fontFamily="var(--font-overpass-mono), monospace"
          fontSize={0.1 * S * 1.1}
          fontWeight="600"
          letterSpacing="1.2"
        >
          <text x={0.2 * S} y={0.26 * S}>
            {pose.plate}
          </text>
          <text x={faceW - 0.2 * S} y={0.26 * S} textAnchor="end">
            RAJPUT-HEMANT
          </text>
        </g>
        {rowsShown.map((row, r) => {
          const w = row.w * S;
          const h = row.h * S;
          const gap = MODULE_GAP * S;
          const span = row.n * w + (row.n - 1) * gap;
          // Rows sit where they do on the full face, measured from its top.
          const cy = (HOUSING.H / 2 - row.y) * S;
          const text = rows[r] ?? "";
          return (
            <g key={r}>
              {Array.from({ length: row.n }, (_, i) => {
                const x = cx - span / 2 + i * (w + gap);
                const char = text[i] ?? " ";
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={cy - h / 2}
                      width={w}
                      height={h}
                      rx="2"
                      fill="#282f35"
                    />
                    <rect
                      x={x}
                      y={cy}
                      width={w}
                      height={h / 2}
                      rx="2"
                      fill="#21272c"
                    />
                    <line
                      x1={x}
                      x2={x + w}
                      y1={cy}
                      y2={cy}
                      stroke="#0a0c0e"
                      strokeWidth="1.2"
                    />
                    {char !== " " && (
                      <text
                        x={x + w / 2}
                        y={cy + h * 0.3}
                        textAnchor="middle"
                        fontFamily="var(--font-overpass-mono), monospace"
                        fontWeight="700"
                        fontSize={h * 0.62}
                        fill={
                          r === yellowRow && i >= yellowFrom
                            ? "#ffc20e"
                            : "#f4f6f7"
                        }
                      >
                        {char}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        <rect
          x={0.2 * S}
          y={faceH - 0.2 * S - 2}
          width={faceW - 0.4 * S}
          height="4.4"
          fill="#39424a"
        />
        {pose.extra ? (
          <PosterExtra
            extra={pose.extra}
            S={S}
            open={board === OWNER_ON_BOARD}
          />
        ) : null}
      </g>
    </svg>
  );
}

/**
 * The route's object beside the indicator, drawn at rest in the housing's
 * coordinates (px from its top-left corner): the clock reads 10:10, the
 * beacon is unlit, the leaflet is folded and the padlock is shut until
 * `open` (the owner is signed in).
 */
function PosterExtra({
  extra,
  S,
  open,
}: {
  extra: Extra;
  S: number;
  open: boolean;
}) {
  const at = (x: number, y: number) =>
    [(x + HOUSING.W / 2) * S, (HOUSING.H / 2 - y) * S] as const;
  if (extra === "clock") {
    const { r } = EXTRAS.clock;
    const [x, y] = at(EXTRAS.clock.x, HOUSING.H / 2 - r - 0.08);
    const R = r * S;
    return (
      <g transform={`translate(${x} ${y})`}>
        <line y1={-R} y2={-y - 96} className="stroke-ink" strokeWidth="2" />
        <circle r={R + 0.05 * S} fill="#1b2025" />
        <circle r={R} fill="#f4f6f7" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={-0.02 * S}
            y={-R * 0.82 - 0.065 * S}
            width={0.04 * S}
            height={0.13 * S}
            fill="#14191e"
            transform={`rotate(${i * 30})`}
          />
        ))}
        <rect
          x={-0.03 * S}
          y={-R * 0.62 + 0.06 * S}
          width={0.06 * S}
          height={R * 0.62}
          fill="#14191e"
          transform="rotate(305)"
        />
        <rect
          x={-0.0225 * S}
          y={-R * 0.9 + 0.06 * S}
          width={0.045 * S}
          height={R * 0.9}
          fill="#14191e"
          transform="rotate(60)"
        />
      </g>
    );
  }
  if (extra === "beacon") {
    const { x: bx, h } = EXTRAS.beacon;
    const [x, y] = at(bx, HOUSING.H / 2);
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect
          x={-0.14 * S}
          y={-0.06 * S}
          width={0.28 * S}
          height={0.06 * S}
          fill="#1b2025"
        />
        <rect
          x={-0.105 * S}
          y={-h * S}
          width={0.21 * S}
          height={(h - 0.06) * S}
          rx={0.03 * S}
          fill="#ffb000"
          opacity="0.82"
        />
      </g>
    );
  }
  if (extra === "leaflet") {
    const { panel } = EXTRAS.leaflet;
    const [pw, ph] = panel;
    const [x, y] = at(EXTRAS.leaflet.x, HOUSING.H / 2 - ph / 2 - 0.2);
    return (
      <g transform={`translate(${x} ${y})`}>
        <line
          y1={(-ph / 2) * S}
          y2={-y - 96}
          className="stroke-ink"
          strokeWidth="2"
        />
        <rect
          x={(-pw / 2) * S}
          y={(-ph / 2) * S}
          width={pw * S}
          height={ph * S}
          fill="#ffc20e"
        />
        <rect
          x={(pw / 2) * S}
          y={(-ph / 2) * S + 2}
          width="5"
          height={ph * S - 4}
          fill="#c9ced3"
        />
      </g>
    );
  }
  const { w, h } = EXTRAS.padlock;
  const [x, y] = at(EXTRAS.padlock.x, 0.05);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-0.61 * S}
        y={(-h / 2 - 0.105) * S}
        width={0.72 * S}
        height={0.05 * S}
        fill="#1b2025"
      />
      <path
        transform={open ? `translate(0 ${-0.13 * S})` : undefined}
        d={`M${-0.15 * S} ${(-h / 2) * S}a${0.15 * S} ${0.15 * S} 0 0 1 ${0.3 * S} 0`}
        fill="none"
        stroke="#9aa4ad"
        strokeWidth={0.07 * S}
      />
      <rect
        x={(-w / 2) * S}
        y={(-h / 2) * S}
        width={w * S}
        height={h * S}
        rx="3"
        fill="#c9a227"
      />
      <circle cy={0.02 * S} r={0.035 * S} fill="#14191e" />
    </g>
  );
}
