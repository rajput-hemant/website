import {
  contour,
  heightAt,
  levels,
  ringPath,
  screenY,
  SHEET,
  type Prop,
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

/** Where a prop stands on the flat sheet, lifted onto the ground under it. */
function standOn(relief: Relief, x: number, p: number, lift = 0) {
  const h = x < relief.coast ? heightAt(relief.summits, x, p) : 0;
  return { x, y: screenY(p, h) - lift };
}

/** A prop's flat twin, for the poster and the permanent T0 fallback. */
function PropTwin({ relief, prop }: { relief: Relief; prop: Prop }) {
  const { x, y } = standOn(relief, prop.x, prop.p, prop.lift);
  const k = prop.size ?? 1;
  const ink = prop.hot ? "stroke-water" : "stroke-ink";
  switch (prop.kind) {
    case "pillar":
      return (
        <path
          d={`M${x} ${y - 9}L${x + 4} ${y}H${x - 4}Z`}
          className={`fill-sheet ${ink}`}
          strokeWidth="0.8"
        />
      );
    case "antiquity":
      return (
        <path
          d={`M${x} ${y}V${y - 10}M${x - 3} ${y - 6.5}H${x + 3}`}
          className={ink}
          strokeWidth="1.2"
        />
      );
    case "works":
      return (
        <rect
          x={x - 3}
          y={y - 6}
          width="6"
          height="6"
          className={`fill-sheet ${ink}`}
          strokeWidth="0.8"
          strokeDasharray="2 1.2"
        />
      );
    case "stone":
      return prop.id === "stone:spare" ? null : (
        <circle
          cx={x}
          cy={y - 1.2 * k}
          r={1.4 * k}
          className={prop.hot ? "fill-water" : "fill-ink-faint"}
        />
      );
    case "stake":
      return (
        <g className={prop.hot ? "stroke-water" : "stroke-wood"}>
          <path d={`M${x} ${y}V${y - 10}`} strokeWidth="0.9" />
          <path
            d={`M${x} ${y - 10}h4.5l-1 1.6 1 1.6H${x}`}
            className="fill-contour stroke-contour"
            strokeWidth="0.4"
          />
        </g>
      );
    case "tent":
      return (
        <path
          d={`M${x - 5} ${y}L${x} ${y - 6}L${x + 5} ${y}Z`}
          className="fill-wood stroke-ink"
          strokeWidth="0.6"
        />
      );
    case "buoy":
      return (
        <g className="stroke-ink" strokeWidth="0.6">
          <path d={`M${x} ${y - 3}V${y - 9}`} />
          <circle cx={x} cy={y - 2} r="2.4" className="fill-contour" />
        </g>
      );
    case "light":
      return (
        <g>
          <path
            d={`M${x} ${y - 16}L${x - 70} ${y - 30}V${y - 4}Z`}
            className="fill-water"
            opacity="0.12"
          />
          <path
            d={`M${x - 2.4} ${y}L${x - 1.6} ${y - 15}H${x + 1.6}L${x + 2.4} ${y}Z`}
            className="fill-sheet stroke-ink"
            strokeWidth="0.6"
          />
        </g>
      );
    case "ray": {
      if (!prop.to) return null;
      const end = standOn(relief, prop.to[0], prop.to[1]);
      return (
        <path
          d={`M${x} ${y}L${end.x} ${end.y}`}
          className="stroke-water"
          strokeWidth="0.8"
          strokeDasharray="3 2.5"
          opacity="0.8"
        />
      );
    }
    default:
      return null;
  }
}

/**
 * The ground of the sheet, drawn flat: the map face, the grid, the boundary
 * between employment and own work, stepped terraces with their contours, and
 * the sea past today, then the page's props. It is the relief's poster and
 * its fallback; the WebGL mesh draws the same ground once it runs.
 * Server-rendered, aria-hidden.
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
      {relief.props?.length ? (
        <g className="fill-none">
          {relief.props.map((prop, i) => (
            <PropTwin key={i} relief={relief} prop={prop} />
          ))}
        </g>
      ) : null}
    </g>
  );
}
