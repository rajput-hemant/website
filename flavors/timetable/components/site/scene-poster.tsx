import { composeBoard } from "@/flavors/timetable/lib/board";
import {
  HOUSING,
  MODULE_GAP,
  MODULE_ROWS,
  poses,
  type SceneRoute,
} from "@/flavors/timetable/lib/scene/poses";

/** Scene units to poster px: the face is 420px wide. */
const S = 420 / HOUSING.W;
const FACE_H = HOUSING.H * S;
const TOP = 96;
const ROD_X = HOUSING.rodX * S;

/**
 * The indicator as a static drawing: the poster before WebGL is ready, and
 * the permanent fallback without it. It reads the same board as the scene.
 */
export function ScenePoster({
  route,
  board,
}: {
  route: SceneRoute;
  board?: string;
}) {
  const { rows, yellowFrom } = composeBoard(board ?? poses[route].board);
  const right = poses[route].yaw < 0;
  return (
    <svg
      viewBox="0 0 480 330"
      preserveAspectRatio="xMidYMid meet"
      className="size-full"
    >
      <g className="stroke-ink" strokeWidth="2">
        <line
          x1={240 - ROD_X}
          y1="0"
          x2={240 - ROD_X}
          y2={TOP + (right ? 6 : -6)}
        />
        <line
          x1={240 + ROD_X}
          y1="0"
          x2={240 + ROD_X}
          y2={TOP + (right ? -6 : 6)}
        />
      </g>
      <g
        transform={`translate(30 ${TOP}) ${right ? "matrix(1 -0.03 0 1 0 6)" : "matrix(1 0.03 0 1 0 -6)"}`}
      >
        <rect
          x={right ? 420 : -14}
          y="4"
          width="14"
          height={FACE_H}
          fill="#0c0f12"
        />
        <rect width="420" height={FACE_H} rx="4" fill="#1b2025" />
        <g
          fill="#9aa4ad"
          fontFamily="var(--font-overpass-mono), monospace"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="1.2"
        >
          <text x="18" y="22">
            {poses[route].plate}
          </text>
          <text x="402" y="22" textAnchor="end">
            RAJPUT-HEMANT
          </text>
        </g>
        {MODULE_ROWS.map((row, r) => {
          const w = row.w * S;
          const h = row.h * S;
          const gap = MODULE_GAP * S;
          const span = row.n * w + (row.n - 1) * gap;
          const cy = FACE_H / 2 - row.y * S;
          const text = rows[r] ?? "";
          return (
            <g key={r}>
              {Array.from({ length: row.n }, (_, i) => {
                const x = 210 - span / 2 + i * (w + gap);
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
                          r === 0 && i >= yellowFrom ? "#ffc20e" : "#f4f6f7"
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
          x="17.5"
          y={FACE_H - 0.2 * S - 2}
          width="385"
          height="4.4"
          fill="#39424a"
        />
      </g>
    </svg>
  );
}
