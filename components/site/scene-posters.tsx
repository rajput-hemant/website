import type * as React from "react";

import type { SceneRoute } from "./scene-slot";

type V3 = [number, number, number];
type Tone = "ink" | "accent" | "faint" | "dash";
type Box = { at: V3; size: V3; tone?: Tone };

const TONE: Record<Tone, string> = {
  ink: "stroke-ink-soft",
  accent: "stroke-accent",
  faint: "stroke-ink-faint",
  dash: "stroke-accent [stroke-dasharray:4_4]",
};

/* The mock's 3/4 view: yaw -0.62, pitch 0.32, orthographic. */
const CY = Math.cos(-0.62);
const SY = Math.sin(-0.62);
const CP = Math.cos(0.32);
const SP = Math.sin(0.32);

function view([x, y, z]: V3): V3 {
  const rx = x * CY + z * SY;
  const rz = -x * SY + z * CY;
  return [rx, y * CP - rz * SP, y * SP + rz * CP];
}

const FACES: { normal: V3; corners: V3[] }[] = [
  {
    normal: [1, 0, 0],
    corners: [
      [1, -1, -1],
      [1, 1, -1],
      [1, 1, 1],
      [1, -1, 1],
    ],
  },
  {
    normal: [-1, 0, 0],
    corners: [
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, 1],
      [-1, 1, -1],
    ],
  },
  {
    normal: [0, 1, 0],
    corners: [
      [-1, 1, -1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, 1, -1],
    ],
  },
  {
    normal: [0, -1, 0],
    corners: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, -1, 1],
      [-1, -1, 1],
    ],
  },
  {
    normal: [0, 0, 1],
    corners: [
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ],
  },
  {
    normal: [0, 0, -1],
    corners: [
      [-1, -1, -1],
      [-1, 1, -1],
      [1, 1, -1],
      [1, -1, -1],
    ],
  },
];

const VISIBLE = FACES.filter((face) => view(face.normal)[2] > 1e-6);

/**
 * Hidden-line linework from boxes: each box's visible faces, filled with the
 * ground so nearer boxes cover farther edges, drawn back to front.
 */
function Linework({ boxes }: { boxes: Box[] }) {
  const polys = [...boxes]
    .sort((a, b) => view(a.at)[2] - view(b.at)[2])
    .map((box) => ({
      tone: box.tone ?? "ink",
      faces: VISIBLE.map((face) =>
        face.corners.map((corner) => {
          const [x, y] = view([
            box.at[0] + (corner[0] * box.size[0]) / 2,
            box.at[1] + (corner[1] * box.size[1]) / 2,
            box.at[2] + (corner[2] * box.size[2]) / 2,
          ]);
          return [x * 100, -y * 100] as const;
        })
      ),
    }));
  const points = polys.flatMap((poly) => poly.faces.flat());
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [minX, minY] = [Math.min(...xs) - 10, Math.min(...ys) - 10];
  const width = Math.max(...xs) + 10 - minX;
  const height = Math.max(...ys) + 10 - minY;

  return (
    <Svg
      viewBox={`${minX.toFixed(0)} ${minY.toFixed(0)} ${width.toFixed(0)} ${height.toFixed(0)}`}
    >
      {polys.map((poly, i) => (
        <g key={i} className={TONE[poly.tone]}>
          {poly.faces.map((face, j) => (
            <polygon
              key={j}
              className="fill-ground"
              points={face
                .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
                .join(" ")}
            />
          ))}
        </g>
      ))}
    </Svg>
  );
}

function Svg({
  viewBox,
  children,
}: {
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      strokeLinejoin="round"
      className="size-full [&_*]:[vector-effect:non-scaling-stroke]"
    >
      {children}
    </svg>
  );
}

/* The plan chest: carcass, top, legs and five drawers; `open` pulls drawers out. */
const W = 3.6;
const H = 2.6;
const D = 2.3;
const DH = (H - 0.3) / 5;

function chest({
  open = {},
  accent = 0,
  sheets = 0,
  missing = false,
}: {
  open?: Record<number, number>;
  accent?: number;
  sheets?: number;
  missing?: boolean;
}): Box[] {
  const boxes: Box[] = [
    { at: [0, 0, 0], size: [W, H, D] },
    { at: [0, H / 2 + 0.04, 0], size: [W + 0.08, 0.08, D + 0.08] },
    ...[-1, 1].flatMap((sx) =>
      [-1, 1].map((sz): Box => ({
        at: [sx * (W / 2 - 0.12), -H / 2 - 0.22, sz * (D / 2 - 0.12)],
        size: [0.08, 0.45, 0.08],
      }))
    ),
  ];
  for (let k = 0; k < 5; k++) {
    const y = H / 2 - 0.2 - DH * k - DH / 2;
    const out = (open[k] ?? 0) * 1.9;
    const z = D / 2 + 0.03 + out;
    const tone: Tone = k === accent ? "accent" : "ink";
    if (out > 0) {
      boxes.push({
        at: [0, y - DH * 0.15, D / 2 + out / 2],
        size: [W - 0.16, DH * 0.55, out],
        tone: "faint",
      });
      for (let s = 0; s < sheets; s++) {
        boxes.push({
          at: [
            0.04 * s,
            y - DH * 0.15 + DH * 0.3 + s * 0.02,
            D / 2 + out / 2 - 0.05 * s,
          ],
          size: [W - 0.5, 0.01, out - 0.25],
          tone: s === sheets - 1 ? "accent" : "faint",
        });
      }
      if (missing) {
        boxes.push({
          at: [0, y + DH * 0.45, D / 2 + out / 2],
          size: [W - 0.5, 0.01, out - 0.25],
          tone: "dash",
        });
      }
    }
    boxes.push(
      { at: [0, y, z], size: [W - 0.1, DH - 0.06, 0.06], tone },
      { at: [0, y + 0.06, z + 0.04], size: [0.46, 0.12, 0.02], tone },
      { at: [0, y - 0.1, z + 0.055], size: [0.7, 0.04, 0.05], tone }
    );
  }
  return boxes;
}

const DRAFTING_TABLE: Box[] = [
  { at: [0, 0, 0], size: [4.2, 0.1, 2.6] },
  ...[-1, 1].flatMap((sx) =>
    [-1, 1].map((sz): Box => ({
      at: [sx * 1.9, -0.85, sz * 1.1],
      size: [0.08, 1.6, 0.08],
    }))
  ),
  { at: [0, 0.06, 0.1], size: [2.8, 0.01, 1.9], tone: "faint" },
  { at: [0.1, 0.075, 0.05], size: [2.8, 0.01, 1.9], tone: "accent" },
  { at: [0.1, 0.085, 0.82], size: [2.8, 0.01, 0.26], tone: "accent" },
];

const STUDIES: Box[] = [0, 1, 2].map((i) => ({
  at: [i * 0.9 - 0.9, i * 0.08, -i * 0.5],
  size: [2, 0.02, 1.4],
  tone: i === 0 ? "accent" : "ink",
}));

/* Flat drawings for the sheets that are about a convention, not the chest. */

function ChainDimension() {
  const ticks = [20, 96, 132, 214, 282, 380];
  const segments = ticks.slice(0, -2).map((x, i) => [x, ticks[i + 1] ?? x]);
  return (
    <Svg viewBox="0 0 400 200">
      <g className="stroke-ink-soft">
        {segments.map(([from = 0, to = 0], i) => (
          <rect
            key={from}
            x={from + 4}
            y={60 - (i % 3) * 14}
            width={to - from - 8}
            height={50 + (i % 3) * 14}
          />
        ))}
        {ticks.map((x) => (
          <path key={x} d={`M${x} 118V152`} />
        ))}
        <path d="M20 140H282" />
      </g>
      <g className="stroke-accent">
        <path d="M282 140H380" />
        <rect x={286} y={46} width={90} height={64} />
      </g>
      <g className="stroke-ink-soft">
        {ticks.map((x) => (
          <path key={x} d={`M${x - 5} 145L${x + 5} 135`} />
        ))}
      </g>
    </Svg>
  );
}

function ScheduleTable() {
  const rows = [0, 1, 2, 3, 4];
  return (
    <Svg viewBox="0 0 400 220">
      <g className="stroke-ink-soft">
        <rect x={40} y={20} width={320} height={180} />
        <path d="M40 48H360" strokeWidth={2} />
        {rows.slice(1).map((r) => (
          <path key={r} d={`M40 ${48 + r * 30.4}H360`} />
        ))}
        <path d="M92 20V200M250 20V200M310 20V200" />
        {rows.map((r) => (
          <circle
            key={r}
            cx={66}
            cy={63 + r * 30.4}
            r={9}
            className={r === 1 ? "stroke-accent" : undefined}
          />
        ))}
        {rows.map((r) => (
          <path
            key={r}
            d={`M106 ${63 + r * 30.4}H${190 + ((r * 37) % 50)}`}
            className="stroke-ink-faint"
          />
        ))}
      </g>
      <path d="M40 78.4H360V108.8H40Z" className="stroke-accent" />
    </Svg>
  );
}

function RevisionCloud() {
  const scallops = (x: number, y: number, w: number, h: number, r: number) => {
    let d = `M${x} ${y}`;
    for (let i = 0; i < w / (2 * r); i++) d += `a${r} ${r} 0 0 1 ${2 * r} 0`;
    for (let i = 0; i < h / (2 * r); i++) d += `a${r} ${r} 0 0 1 0 ${2 * r}`;
    for (let i = 0; i < w / (2 * r); i++) d += `a${r} ${r} 0 0 1 ${-2 * r} 0`;
    for (let i = 0; i < h / (2 * r); i++) d += `a${r} ${r} 0 0 1 0 ${-2 * r}`;
    return d;
  };
  return (
    <Svg viewBox="0 0 400 220">
      <g className="stroke-ink-soft">
        <rect x={40} y={30} width={320} height={160} />
        <path
          d="M70 70H200M70 96H240M70 122H180M70 148H220"
          className="stroke-ink-faint"
        />
      </g>
      <g className="stroke-accent">
        <path d={scallops(60, 84, 200, 48, 8)} />
        <path d="M300 60L324 102H276Z" />
        <path d="M312 84V94" />
      </g>
    </Svg>
  );
}

function DetailCallout() {
  return (
    <Svg viewBox="0 0 400 220">
      <g className="stroke-ink-soft">
        <rect x={50} y={60} width={150} height={100} />
        <path d="M50 110H200M125 60V160" className="stroke-ink-faint" />
      </g>
      <g className="stroke-accent">
        <circle cx={170} cy={82} r={30} className="[stroke-dasharray:4_4]" />
        <path d="M196 68L292 50" />
        <circle cx={318} cy={50} r={26} />
        <path d="M292 50H344" />
      </g>
    </Svg>
  );
}

function A4Sheet() {
  return (
    <Svg viewBox="0 0 400 240">
      <g className="stroke-ink-soft">
        <rect x={140} y={16} width={148} height={209} />
        <rect
          x={148}
          y={24}
          width={132}
          height={193}
          className="stroke-ink-faint"
        />
        <path d="M156 44H236M156 58H264" />
        <path
          d="M156 80H264M156 92H250M156 104H258M156 126H264M156 138H240M156 150H256M156 172H230"
          className="stroke-ink-faint"
        />
        <rect x={220} y={190} width={60} height={27} />
        <path d="M220 203H280M250 190V217" />
      </g>
      <g className="stroke-accent">
        <path d="M118 16V225M112 16H124M112 225H124" />
        <path d="M118 16l-3 8M118 16l3 8M118 225l-3-8M118 225l3-8" />
      </g>
    </Svg>
  );
}

const POSTERS: Record<SceneRoute, () => React.ReactNode> = {
  home: () => <Linework boxes={chest({ open: { 0: 0.55 } })} />,
  projects: () => <Linework boxes={chest({ open: { 0: 1 }, sheets: 3 })} />,
  project: () => <Linework boxes={DRAFTING_TABLE} />,
  work: () => <ChainDimension />,
  about: () => <ScheduleTable />,
  now: () => <RevisionCloud />,
  ask: () => <DetailCallout />,
  lab: () => <Linework boxes={STUDIES} />,
  resume: () => <A4Sheet />,
  notfound: () => (
    <Linework boxes={chest({ open: { 0: 1 }, accent: -1, missing: true })} />
  ),
};

/** The route's static linework drawing: the M1 poster and the permanent no-WebGL fallback. */
export function ScenePoster({ route }: { route: SceneRoute }) {
  return POSTERS[route]();
}
