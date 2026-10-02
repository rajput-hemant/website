import type * as React from "react";

/*
 * The tracked views' printed posters: what each view draws at rest, as
 * server-rendered SVG. They hold the box, stay as the no-WebGL fallback and
 * fade once the view has drawn. Plain SVG, so the client components that
 * place a view (the now index) carry only these few lines; the stack's
 * poster, drawn like the route posters, lives in scene-posters.tsx.
 */

const svgClass =
  "size-full overflow-visible [&_*]:[vector-effect:non-scaling-stroke]";

function Flat({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      fill="none"
      preserveAspectRatio="none"
      className={svgClass}
    >
      {children}
    </svg>
  );
}

/** Home H2 at rest: the scale's two near faces, year graduations on the top one. */
export function ScalePoster({ from, to }: { from: number; to: number }) {
  const span = Math.max(1, to - from);
  const count = span * 4;
  return (
    <Flat>
      <g className="stroke-ink-soft">
        <rect x="0" y="22%" width="100%" height="56%" />
        <line x1="0" y1="52%" x2="100%" y2="52%" />
      </g>
      {Array.from({ length: count + 1 }, (_, i) => {
        const x = `${(i / count) * 100}%`;
        const year = i % 4 === 0;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1="52%"
            y2={year ? "30%" : "40%"}
            className={i === count ? "stroke-accent" : "stroke-ink-soft"}
          />
        );
      })}
    </Flat>
  );
}

/** Work W1 at rest: the rail's scale seen square on, a graduation per year. */
export function YearScalePoster({ years }: { years: number }) {
  const n = Math.max(1, years);
  return (
    <Flat>
      <g className="stroke-ink-soft">
        <rect x="30%" y="0" width="40%" height="100%" />
      </g>
      {Array.from({ length: n }, (_, i) => {
        const y = `${((i + 0.5) / n) * 100}%`;
        return (
          <line
            key={i}
            x1="30%"
            x2="62%"
            y1={y}
            y2={y}
            className={i === 0 ? "stroke-accent" : "stroke-ink-soft"}
          />
        );
      })}
    </Flat>
  );
}

/** About B1 at rest: the dividers parked on note one, points on the first two notes. */
export function DividersPoster() {
  return (
    <Flat>
      <g className="stroke-ink-soft">
        <circle cx="30%" cy="11%" r="3" />
        <line x1="30%" y1="11%" x2="85%" y2="2%" />
        <line x1="30%" y1="11%" x2="85%" y2="22%" />
      </g>
    </Flat>
  );
}

/** Now N2 at rest: a pile of sheets beside each year, its height the year's entries. */
export function PilesPoster({ counts }: { counts: readonly number[] }) {
  const n = Math.max(1, counts.length);
  return (
    <Flat>
      {counts.map((count, i) => {
        const sheets = Math.max(1, Math.min(12, count));
        const cy = ((i + 0.5) / n) * 100;
        return (
          <g key={i} className="stroke-ink-soft">
            {Array.from({ length: sheets }, (_, s) => (
              <line
                key={s}
                x1="20%"
                x2="90%"
                y1={`${cy}%`}
                y2={`${cy}%`}
                transform={`translate(0 ${6 - s * 1.5})`}
              />
            ))}
          </g>
        );
      })}
    </Flat>
  );
}
