import {
  contour,
  levels,
  ringPath,
  screenY,
  SHEET,
  type Relief,
} from "@/flavors/survey/lib/relief";

const { X0, X1, Y0, P, YS, LIFT, INDEX, ROW } = SHEET;
const Y1 = Y0 + P * YS;

/** Sea hachure: lines crowd toward the coast, as on an engraved chart. */
export function seaLines(coast: number) {
  const lines: number[] = [];
  for (let d = 3.5, gap = 4; coast + d < X1; gap += 1.6, d += gap) {
    lines.push(coast + d);
  }
  return lines;
}

/**
 * The ground of the sheet, drawn flat: the map face, the grid, the boundary
 * between employment and own work, stepped terraces with their contours, and
 * the sea past today. It is the relief's poster and its fallback; the WebGL
 * mesh draws the same ground once it runs. Server-rendered, aria-hidden.
 */
export function SheetGround({
  relief,
  id,
}: {
  relief: Relief;
  /** Unique per page, for the terrace references. */
  id: string;
}) {
  const hills = relief.summits;
  const years = Array.from(
    { length: relief.to - relief.from - 1 },
    (_, i) => X0 + (i + 1) * relief.yearW
  );
  const rows = Array.from({ length: 9 }, (_, i) => screenY((i + 1) * ROW));

  return (
    <g aria-hidden>
      <defs>
        <clipPath id={`${id}-land`}>
          <rect x="0" y="0" width={relief.coast} height={SHEET.H} />
        </clipPath>
      </defs>
      <rect
        x={X0}
        y={Y0}
        width={X1 - X0}
        height={Y1 - Y0}
        className="fill-sheet"
      />
      <rect
        x={X0}
        y={Y1}
        width={X1 - X0}
        height="12"
        className="fill-wall opacity-50"
      />
      <g className="fill-none stroke-grid" strokeWidth="0.7">
        <path
          d={`${years.map((x) => `M${x.toFixed(1)} ${Y0}V${Y1}`).join("")}${rows
            .map((y) => `M${X0} ${y.toFixed(1)}H${relief.coast.toFixed(1)}`)
            .join("")}`}
        />
      </g>
      <line
        x1={X0}
        x2={relief.coast}
        y1={screenY(SHEET.BOUNDARY)}
        y2={screenY(SHEET.BOUNDARY)}
        className="stroke-ink-soft"
        strokeWidth="0.8"
        strokeDasharray="8 3 1.5 3"
        opacity="0.75"
      />
      <g clipPath={`url(#${id}-land)`}>
        {levels(relief).map((level, i) => {
          const d = ringPath(contour(hills, level));
          const lift = level * LIFT;
          const ref = `${id}-t${level}`;
          return (
            <g key={level} transform={`translate(0 ${-lift})`}>
              <use
                href={`#${ref}`}
                y={2 * LIFT}
                className="fill-wall opacity-55"
              />
              <use href={`#${ref}`} y={LIFT} className="fill-wall opacity-55" />
              <path
                id={ref}
                d={d}
                style={{ fill: `var(--color-tint-${Math.min(8, i + 1)})` }}
              />
              <path
                d={d}
                className="fill-none stroke-contour"
                strokeWidth={level % INDEX === 0 ? 1.5 : 0.7}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </g>
      <rect
        x={relief.coast}
        y={Y0}
        width={Math.max(0, X1 - relief.coast)}
        height={Y1 - Y0}
        className="fill-sea"
      />
      <path
        d={seaLines(relief.coast)
          .map((x) => `M${x.toFixed(1)} ${Y0}V${Y1}`)
          .join("")}
        className="stroke-water"
        strokeWidth="0.55"
        opacity="0.7"
      />
      <line
        x1={relief.coast}
        x2={relief.coast}
        y1={Y0}
        y2={Y1}
        className="stroke-water"
        strokeWidth="1.3"
      />
    </g>
  );
}
