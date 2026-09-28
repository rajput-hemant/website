import { stateLabels, type MissionState } from "@/flavors/mission/lib/flight";
import { PATCH_C, patchFor } from "@/flavors/mission/lib/patch";
import { cn } from "@/flavors/mission/lib/utils";

const C = PATCH_C;

/**
 * A mission patch, drawn from the project: the name round the top, the
 * designation and state round the foot, and inside the rim one orbit per
 * technology aboard. Decoration on facts already in text, so it is hidden.
 */
export function MissionPatch({
  id,
  name,
  code,
  state,
  technologies,
  year,
  index,
  className,
}: {
  /** Unique on the page, for the text paths and the clip. */
  id: string;
  name: string;
  code: string;
  state: MissionState;
  technologies: number;
  year: number | null;
  index: number;
  className?: string;
}) {
  const patch = patchFor({ technologies, state, year, index });
  const top = `${id}-t`;
  const foot = `${id}-b`;
  const clip = `${id}-k`;
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
      className={cn("patch block overflow-visible", className)}
    >
      <defs>
        <path id={top} d="M11 60A49 49 0 0 1 109 60" />
        <path id={foot} d="M6.5 60A53.5 53.5 0 0 0 113.5 60" />
        <clipPath id={clip}>
          <circle cx={C} cy={C} r="44" />
        </clipPath>
      </defs>
      <circle cx={C} cy={C} r="58" className="pr" />
      <circle cx={C} cy={C} r="44.5" className="pr2" />
      <text className="pt">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">
          {name.toUpperCase()}
        </textPath>
      </text>
      <text className="pb">
        <textPath href={`#${foot}`} startOffset="50%" textAnchor="middle">
          {code} · {stateLabels[state].toUpperCase()}
        </textPath>
      </text>
      <circle cx="8.5" cy={C} r="1.6" className="pd" />
      <circle cx="111.5" cy={C} r="1.6" className="pd" />
      <g clipPath={`url(#${clip})`}>
        <g transform={`rotate(-18 ${C} ${C})`}>
          <g className="orb">
            {patch.orbits.map((orbit) => (
              <ellipse
                key={orbit.rx}
                cx={C}
                cy={C}
                rx={orbit.rx}
                ry={orbit.ry}
                className={orbit.kind === "solid" ? "po" : `po ${orbit.kind}`}
              />
            ))}
            <circle cx={C} cy={C} r={patch.planet} className="pl" />
            {patch.orbits.map((orbit) =>
              orbit.front ? (
                <g key={orbit.rx}>
                  <path d={orbit.front} className="po gap" />
                  <path
                    d={orbit.front}
                    className={
                      orbit.kind === "solid" ? "po" : `po ${orbit.kind}`
                    }
                  />
                </g>
              ) : null
            )}
            {patch.craft ? (
              <circle
                cx={patch.craft.x}
                cy={patch.craft.y}
                r="3"
                className="pc"
              />
            ) : null}
            {patch.decay ? (
              <>
                <polyline points={patch.decay.points} className="ps" />
                <circle
                  cx={patch.decay.end.x}
                  cy={patch.decay.end.y}
                  r="1.8"
                  className="pd"
                />
              </>
            ) : null}
          </g>
        </g>
      </g>
    </svg>
  );
}
