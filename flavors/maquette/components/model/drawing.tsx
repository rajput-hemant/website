import type { Piece } from "@/flavors/maquette/lib/model";
import { cn } from "@/flavors/maquette/lib/utils";

import { PlanShadow } from "./plan-shadow";

const W = 280;
const H = 176;
/** The plan's site card, north up. */
const SITE = { x: 144, y: 24, w: 128, h: 112 };
/** The elevation's plinth line. */
const BASE = 146;

/**
 * A vitrine's drawing: the piece in elevation on the left, in plan on the
 * right, the plan shadow cast by the study's sun. Everything is measured
 * from the piece: bays across, storeys up.
 */
export function PieceDrawing({
  piece,
  className,
}: {
  piece: Pick<Piece, "cols" | "rows" | "storeys" | "bays" | "finish"> & {
    name: string;
  };
  className?: string;
}) {
  const { cols, rows, storeys, finish } = piece;
  const long = Math.max(cols, rows);
  const unit = Math.min(
    20,
    112 / Math.max(long, cols),
    104 / Math.max(1, rows)
  );
  const floor = Math.min(14, 104 / storeys);
  const m = finish.material;
  // One drawing per piece on a page, so its name keys the clip.
  const clip = `plan-${piece.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  // Elevation: the long side, one bay per column, one storey per band.
  const ew = long * unit;
  const eh = storeys * floor;
  const ex = 72 - ew / 2;
  const ey = BASE - eh;
  const elevationLines: string[] = [];
  for (let s = 1; s < storeys; s++)
    elevationLines.push(`M${ex} ${ey + s * floor}H${ex + ew}`);
  for (let c = 1; c < long; c++)
    elevationLines.push(`M${ex + c * unit} ${ey}V${BASE}`);

  // Plan: the footprint, centred on the site card.
  const pw = cols * unit;
  const ph = rows * unit;
  const px = SITE.x + (SITE.w - pw) / 2;
  const py = SITE.y + (SITE.h - ph) / 2;
  const planLines: string[] = [];
  for (let c = 1; c < cols; c++)
    planLines.push(`M${px + c * unit} ${py}V${py + ph}`);
  for (let r = 1; r < rows; r++)
    planLines.push(`M${px} ${py + r * unit}H${px + pw}`);
  const fill = m === "grey" ? "m-grey" : m === "foam" ? "m-foam" : "m-card";
  const line = m === "grey" ? "m-line-grey" : "m-line";

  const label = `Elevation and plan of ${piece.name}: ${finish.word.toLowerCase()}${m === "wood" ? " with the top storey open" : ""}, ${storeys} ${storeys === 1 ? "storey" : "storeys"}, ${piece.bays} ${piece.bays === 1 ? "bay" : "bays"} in a ${cols} by ${rows} grid`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full", className)}
    >
      <rect x={8} y={BASE} width={128} height={6} className="m-plinth" />
      {m === "wood" ? (
        <path
          className="m-wood"
          d={[
            ...Array.from(
              { length: long + 1 },
              (_, c) => `M${ex + c * unit} ${ey}V${BASE}`
            ),
            ...Array.from(
              { length: storeys },
              (_, s) => `M${ex - 1} ${BASE - 1 - s * floor}H${ex + ew + 1}`
            ),
          ].join("")}
        />
      ) : (
        <>
          <rect x={ex} y={ey} width={ew} height={eh} className={fill} />
          <path className={line} d={elevationLines.join("")} />
        </>
      )}
      <rect
        {...{ x: SITE.x, y: SITE.y, width: SITE.w, height: SITE.h }}
        className="m-site"
      />
      <clipPath id={clip}>
        <rect x={SITE.x} y={SITE.y} width={SITE.w} height={SITE.h} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <PlanShadow
          rect={{ x: px, y: py, w: pw, h: ph }}
          height={storeys * floor * (unit / 20)}
          className={cn("m-shade", m === "wood" && "opacity-45")}
        />
      </g>
      {m === "wood" ? (
        <>
          <rect
            x={px}
            y={py}
            width={pw}
            height={ph}
            className="m-wood"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <g className="m-wood-fill">
            {Array.from({ length: (cols + 1) * (rows + 1) }, (_, k) => (
              <circle
                key={k}
                cx={px + (k % (cols + 1)) * unit}
                cy={py + Math.floor(k / (cols + 1)) * unit}
                r={2}
              />
            ))}
          </g>
        </>
      ) : (
        <>
          <rect x={px} y={py} width={pw} height={ph} className={fill} />
          <path className={line} d={planLines.join("")} />
        </>
      )}
      <text x={12} y={168} className="m-label">
        ELEVATION
      </text>
      <text x={148} y={168} className="m-label">
        PLAN, NORTH UP
      </text>
    </svg>
  );
}
