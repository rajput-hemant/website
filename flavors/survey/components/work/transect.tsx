import {
  eastingOf,
  monthLabel,
  profile,
  type Relief,
  type Summit,
} from "@/flavors/survey/lib/relief";
import { cn } from "@/flavors/survey/lib/utils";

const W = 640;
const H = 132;
const BASE = 104;

/**
 * A cross-section east to west along one summit's ridge: the ground from
 * every role there, shaded, with this role's own hill drawn over it. Where
 * the shading rises outside the outline, another role was running at the
 * same time on a neighbouring ridge. Heights to scale; decorative, the
 * article states the same facts.
 */
export function Transect({
  relief,
  summit,
  className,
}: {
  relief: Relief;
  summit: Summit;
  className?: string;
}) {
  const pad = 6;
  const x0 = eastingOf(relief, summit.start - pad);
  const x1 = eastingOf(relief, summit.end + pad);
  const tallest = Math.max(...relief.summits.map((s) => s.h), 1);
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (h: number) => BASE - (h / tallest) * (BASE - 14);
  const ground = profile(relief.summits, summit.p, x0, x1);
  const own = profile([summit], summit.p, x0, x1);
  const line = (pts: [number, number][]) =>
    pts
      .map(
        ([x, h], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(h).toFixed(1)}`
      )
      .join("");
  const area = `${line(ground)}L${W} ${BASE}L0 ${BASE}Z`;
  const ticks = [];
  for (let m = 2; m < tallest; m += 2) ticks.push(m);
  const start = sx(eastingOf(relief, summit.start));
  const end = sx(eastingOf(relief, summit.end));
  const colour = summit.current ? "stroke-revision" : "stroke-contour";

  return (
    <svg
      aria-hidden
      data-draw
      viewBox={`0 0 ${W} ${H}`}
      className={cn("block h-auto w-full overflow-visible", className)}
    >
      <g className="stroke-rule" strokeWidth="0.6">
        {ticks.map((m) => (
          <line
            key={m}
            x1="0"
            x2={W}
            y1={sy(m)}
            y2={sy(m)}
            strokeDasharray={m % 8 ? "2 4" : undefined}
          />
        ))}
      </g>
      <path d={area} className="fill-tint-4" />
      <path
        d={line(own)}
        className={cn("draw-line fill-none", colour)}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line
        x1="0"
        x2={W}
        y1={BASE}
        y2={BASE}
        className="stroke-ink"
        strokeWidth="0.9"
      />
      {[start, end].map((x, i) => (
        <line
          key={i}
          x1={x}
          x2={x}
          y1={BASE}
          y2={BASE + 6}
          className="stroke-ink"
          strokeWidth="0.9"
        />
      ))}
      <circle
        cx={sx(summit.x)}
        cy={sy(summit.h)}
        r="2.4"
        className={summit.current ? "fill-revision" : "fill-ink"}
      />
      <text
        x={sx(summit.x) + 7}
        y={sy(summit.h) - 5}
        className="fill-ink font-sans text-[11px] font-semibold tabular-nums"
      >
        {summit.h}
      </text>
      <g className="fill-ink-faint font-sans text-[10px] font-semibold tracking-[0.12em]">
        <text x={start} y={BASE + 20} textAnchor="middle">
          {monthLabel(summit.start)}
        </text>
        <text x={end} y={BASE + 20} textAnchor="middle">
          {summit.current ? "NOW" : monthLabel(summit.end)}
        </text>
      </g>
      <text
        x="0"
        y="10"
        className="fill-ink-faint font-sans text-[10px] font-semibold tracking-[0.12em]"
      >
        W
      </text>
      <text
        x={W}
        y="10"
        textAnchor="end"
        className="fill-ink-faint font-sans text-[10px] font-semibold tracking-[0.12em]"
      >
        E
      </text>
    </svg>
  );
}
