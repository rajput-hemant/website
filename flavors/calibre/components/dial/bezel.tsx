import * as React from "react";
import { nav } from "@/flavors/calibre/content";
import { roman } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

import { DialBeat } from "./dial-beat";

/** The bezel is drawn on a 600 unit square; the window shows the movement. */
const C = 300;
const OUTER = 296;
const INNER = 238;
const WINDOW = 222;
/** The window's inset as a share of the bezel, for the HTML layer inside it. */
const INSET = `${(((C - WINDOW) / (2 * C)) * 100).toFixed(3)}%`;

const at = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r };
};

/** A circle path for text to run along, clockwise from `deg`. */
const textArc = (r: number, deg: number) => {
  const s = at(deg, r);
  const e = at(deg + 180, r);
  const s2 = at(deg + 360, r);
  return `M${s.x} ${s.y}A${r} ${r} 0 1 1 ${e.x} ${e.y}A${r} ${r} 0 1 1 ${s2.x} ${s2.y}`;
};

/**
 * The case and its bezel: a rhodium band with sixty minute ticks, the four
 * nav pages at their Roman hour marks, the calibre's figures printed round
 * the band, and the blued rim index that beats. The movement (the scene
 * slot, or a page's own subdial) sits in the window. The printed figures
 * are aria-hidden: each is also in text on the technical sheet.
 */
export function Bezel({
  prints,
  children,
  beat = true,
  className,
}: {
  /** Four figures printed round the band, between the hour marks. */
  prints: readonly [string, string, string, string];
  children: React.ReactNode;
  /** Mount the beat: the rim index then runs as a seconds hand. */
  beat?: boolean;
  className?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <div
      data-bezel
      className={cn(
        "relative aspect-square w-full rounded-full shadow-case",
        className
      )}
    >
      <svg
        viewBox="0 0 600 600"
        aria-hidden
        focusable="false"
        className="bezel absolute inset-0 block h-full w-full"
      >
        <defs>
          <radialGradient id={`${id}-sheen`} cx="35%" cy="28%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </radialGradient>
          <path id={`${id}-arc`} d={textArc(267, -90)} />
        </defs>
        <circle className="band" cx={C} cy={C} r={OUTER} />
        <circle cx={C} cy={C} r={OUTER} fill={`url(#${id}-sheen)`} />
        <circle
          className="tick"
          cx={C}
          cy={C}
          r={OUTER - 1}
          fill="none"
          strokeOpacity="0.35"
        />
        <circle className="well" cx={C} cy={C} r={INNER} />
        {Array.from({ length: 60 }, (_, i) => {
          const hour = i % 5 === 0;
          const quarter = i % 15 === 0;
          const a = at(i * 6, OUTER - 8);
          const b = at(i * 6, OUTER - (quarter ? 30 : hour ? 22 : 14));
          return (
            <line
              key={i}
              className="tick"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeWidth={quarter ? 4 : hour ? 3 : 1.2}
              strokeOpacity={hour ? 0.9 : 0.55}
            />
          );
        })}
        {nav.map((item) => {
          const deg = item.hour * 30;
          const p = at(deg, 252);
          return (
            <g
              key={item.href}
              transform={`translate(${p.x} ${p.y}) rotate(${deg === 180 ? 0 : deg})`}
            >
              <text
                className="print numeral-italic"
                textAnchor="end"
                dominantBaseline="central"
                fontSize="23"
                x="-3"
              >
                {roman(item.hour)}
              </text>
              <text
                className="print font-spec"
                dominantBaseline="central"
                fontSize="11"
                letterSpacing="2.4"
                x="4"
              >
                {" "}
                · {item.label.toLowerCase()}
              </text>
            </g>
          );
        })}
        <text
          className="print font-spec"
          fontSize="11.5"
          letterSpacing="3"
          fillOpacity="0.8"
        >
          {prints.map((print, i) => (
            <textPath
              key={print}
              href={`#${id}-arc`}
              startOffset={`${12.5 + i * 25}%`}
              textAnchor="middle"
            >
              {print.toLowerCase()}
            </textPath>
          ))}
        </text>
      </svg>
      <div
        className="absolute overflow-hidden rounded-full bg-well"
        style={{ inset: INSET }}
      >
        {children}
      </div>
      {/* The hand rides above the window, so the movement never covers it. */}
      <svg
        viewBox="0 0 600 600"
        aria-hidden
        focusable="false"
        className="bezel pointer-events-none absolute inset-0 block h-full w-full"
      >
        <g className="rim-index" data-rim-index>
          <path
            d={`M${C} ${C - INNER + 6}L${C - 7} ${C - INNER + 36}H${C - 2}V${C - INNER + 78}H${C + 2}V${C - INNER + 36}H${C + 7}Z`}
            className="fill-steel"
          />
        </g>
      </svg>
      {beat ? <DialBeat /> : null}
    </div>
  );
}
