import {
  LAYOUT,
  parseBoard,
  settings,
} from "@/flavors/calibre/lib/scene/poses";

/** Plate units to the poster's 200 unit square, +y up on the plate. */
const S = 92;
const px = (x: number) => 100 + x * S;
const py = (y: number) => 100 - y * S;

function Wheel({
  x,
  y,
  r,
  teeth,
}: {
  x: number;
  y: number;
  r: number;
  teeth: number;
}) {
  const R = r * S;
  const pitch = (2 * Math.PI * R) / teeth;
  return (
    <g>
      <circle
        cx={px(x)}
        cy={py(y)}
        r={R}
        fill="none"
        className="stroke-scene-wheel"
        strokeWidth={2.4}
        strokeDasharray={`${pitch / 2} ${pitch / 2}`}
      />
      <circle
        cx={px(x)}
        cy={py(y)}
        r={R - 1.6}
        fill="none"
        className="stroke-scene-wheel"
        strokeWidth={1.4}
      />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={px(x)}
            y1={py(y)}
            x2={px(x) + Math.cos(a) * (R - 2)}
            y2={py(y) + Math.sin(a) * (R - 2)}
            className="stroke-scene-wheel"
            strokeWidth={1.6}
          />
        );
      })}
    </g>
  );
}

function Bridge({ d }: { d: string }) {
  return (
    <>
      <path
        d={d}
        className="fill-scene-bridge stroke-scene-case"
        strokeWidth={0.6}
      />
      <path d={d} fill="url(#geneva)" />
    </>
  );
}

/**
 * The movement drawn flat, seen through the caseback: the perlage plate,
 * the gold train, the bridges with their blued screws, the balance and its
 * hairspring, and every jewel (one per project) with this page's lit. It is
 * the poster until the canvas is ready, and the whole scene without WebGL,
 * with the scene off, or on low power.
 */
export function ScenePoster({ board }: { board: string | null }) {
  const { jewels, lit } = parseBoard(board);
  const { centre, third, fourth, escape, balance, barrel } = LAYOUT;
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      focusable="false"
      className="block h-full w-full"
    >
      <defs>
        <pattern
          id="perlage"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="4.5"
            cy="4.5"
            r="3.6"
            fill="none"
            className="stroke-scene-case"
            strokeWidth="0.5"
            strokeOpacity="0.45"
          />
        </pattern>
        <pattern
          id="geneva"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-24)"
        >
          <rect width="6" height="3" fill="#fff" fillOpacity="0.28" />
        </pattern>
      </defs>
      <rect width="200" height="200" className="fill-scene-plate" />
      <rect width="200" height="200" fill="url(#perlage)" />
      <Wheel x={barrel.x} y={barrel.y} r={barrel.r} teeth={64} />
      <Wheel x={centre.x} y={centre.y} r={centre.r} teeth={60} />
      <Wheel x={third.x} y={third.y} r={third.r} teeth={48} />
      <Wheel x={fourth.x} y={fourth.y} r={fourth.r} teeth={44} />
      <Wheel x={escape.x} y={escape.y} r={escape.r} teeth={15} />
      <g>
        <Bridge
          d={`M${px(-0.9)} ${py(0.1)}L${px(0.2)} ${py(0.78)}L${px(0.32)} ${py(0.6)}L${px(-0.8)} ${py(-0.08)}Z`}
        />
        <Bridge
          d={`M${px(0.1)} ${py(0.9)}L${px(0.66)} ${py(-0.5)}L${px(0.46)} ${py(-0.58)}L${px(-0.08)} ${py(0.84)}Z`}
        />
      </g>
      <circle
        cx={px(balance.x)}
        cy={py(balance.y)}
        r={balance.r * S}
        fill="none"
        className="stroke-scene-wheel"
        strokeWidth={3}
      />
      <path
        d={Array.from({ length: 120 }, (_, i) => {
          const t = i / 119;
          const a = t * Math.PI * 2 * 7;
          const r = (0.04 + t * 0.2) * S;
          return `${i ? "L" : "M"}${(px(balance.x) + Math.cos(a) * r).toFixed(1)} ${(py(balance.y) + Math.sin(a) * r).toFixed(1)}`;
        }).join("")}
        fill="none"
        className="stroke-scene-screw"
        strokeWidth={0.6}
        strokeOpacity={0.8}
      />
      {[
        [-0.62, 0.2],
        [0.24, 0.66],
        [0.56, -0.44],
        [-0.02, 0.84],
      ].map(([x = 0, y = 0]) => (
        <circle
          key={`${x}${y}`}
          cx={px(x)}
          cy={py(y)}
          r={3.4}
          className="fill-scene-screw"
        />
      ))}
      {settings(jewels).map((seat) => (
        <g key={seat.n}>
          <circle
            cx={px(seat.x)}
            cy={py(seat.y)}
            r={seat.on === "chaton" ? 4.4 : 2.6}
            className="fill-scene-wheel"
          />
          <circle
            cx={px(seat.x)}
            cy={py(seat.y)}
            r={seat.n === lit ? 3.4 : 2.1}
            className="fill-scene-ruby"
            stroke={seat.n === lit ? "#fff" : "none"}
            strokeWidth={0.8}
          />
        </g>
      ))}
      <circle
        cx="100"
        cy="100"
        r="100"
        fill="none"
        className="stroke-scene-case"
        strokeWidth="4"
      />
    </svg>
  );
}
