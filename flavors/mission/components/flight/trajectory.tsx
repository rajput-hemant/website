"use client";

import * as React from "react";
import {
  isActive,
  phaseSpan,
  readout,
  type Flight,
} from "@/flavors/mission/lib/flight";
import { setScrub } from "@/flavors/mission/lib/scrub";
import {
  NARROW,
  plotFor,
  timeAt,
  WIDE,
  xAt,
  yOn,
  type Plot,
} from "@/flavors/mission/lib/trajectory";
import { cn } from "@/flavors/mission/lib/utils";

const KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
  PageUp: 6,
  PageDown: -6,
};

/** One drawing of the plot at one size; the page shows the wide or the narrow one. */
function PlotSvg({
  plot,
  flight,
  t,
  id,
  label,
  valueText,
  onScrub,
  className,
}: {
  plot: Plot;
  flight: Flight;
  t: number;
  id: string;
  label: string;
  valueText: string;
  onScrub: (t: number | null) => void;
  className?: string;
}) {
  const { size, base } = plot;
  const g = plot.tg < 0 ? size.gutter : 0;
  const x = xAt(plot, t);
  const pre = flight.pre;
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * size.width;
    onScrub(timeAt(plot, px, flight.now));
  };
  const key = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = KEYS[e.key];
    let next: number | null = null;
    if (step !== undefined) next = Math.round(t) + step;
    else if (e.key === "Home") next = plot.tg;
    else if (e.key === "End") next = flight.now;
    if (next === null) return;
    e.preventDefault();
    onScrub(Math.max(plot.tg, Math.min(flight.now, next)));
  };

  return (
    <svg
      viewBox={`0 0 ${size.width} ${size.height}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={Math.round(plot.tg)}
      aria-valuemax={Math.round(flight.now)}
      aria-valuenow={Math.round(t)}
      aria-valuetext={valueText}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") onScrub(null);
      }}
      onKeyDown={key}
      onBlur={() => onScrub(null)}
      className={cn(
        "traj block h-auto w-full cursor-crosshair touch-pan-y overflow-visible focus-visible:outline-offset-[6px]",
        className
      )}
    >
      {g ? (
        <>
          <defs>
            <pattern
              id={`${id}-hatch`}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" className="hl" />
            </pattern>
          </defs>
          <rect
            x="0"
            y="10"
            width={g}
            height={base - 10}
            fill={`url(#${id}-hatch)`}
          />
          {pre ? (
            <text
              className="tl"
              transform={`translate(${g / 2 + 3.5} ${base - 8}) rotate(-90)`}
            >
              PRE-LAUNCH {pre.from} TO {pre.to}
            </text>
          ) : null}
          <line className="axis" x1="0" y1={base} x2={g + 3} y2={base} />
          <path
            className="axis"
            d={`M${g + 1} ${base + 4}l4 -8M${g + 6} ${base + 4}l4 -8`}
          />
        </>
      ) : null}
      <line
        className="axis"
        x1={g ? plot.x0 - 3 : 0}
        y1={base}
        x2={size.width}
        y2={base}
      />
      {plot.ticks.map((tick, i) => (
        <React.Fragment key={i}>
          <line
            className="tk"
            x1={tick.x}
            y1={base}
            x2={tick.x}
            y2={base + (tick.major ? 6 : 3)}
          />
          {tick.label ? (
            <text
              className={i === 0 ? "tx t0" : "tx"}
              x={tick.x}
              y={base + 17}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ) : null}
        </React.Fragment>
      ))}
      <path className="red" d={`M${plot.x0} ${base - 1}l-4 -7h8z`} />
      <line className="now" x1={plot.nowX} y1="12" x2={plot.nowX} y2={base} />
      <text className="tx" x={plot.nowX} y="6" textAnchor="middle">
        NOW
      </text>
      {plot.arcs.map((arc) => {
        const on = isActive(arc.phase, t);
        return (
          <React.Fragment key={arc.phase.id}>
            {arc.cont ? <path className="cont" d={arc.cont} /> : null}
            <path className={on ? "arc on" : "arc"} d={arc.d} />
            <text
              className={on ? "al on" : "al"}
              x={arc.label.x}
              y={arc.label.y}
              textAnchor="middle"
            >
              {arc.phase.code}
            </text>
          </React.Fragment>
        );
      })}
      <line className="cur" x1={x} x2={x} y1="12" y2={base} />
      {plot.arcs.map((arc) =>
        isActive(arc.phase, t) ? (
          <circle
            key={arc.phase.id}
            className="dot"
            r="3.6"
            cx={x}
            cy={yOn(plot, arc, t, flight.now)}
          />
        ) : null
      )}
    </svg>
  );
}

/**
 * Fig. 2, the trajectory: each phase a transfer arc across its real dates,
 * as high as the months served, with the phase list beside it. Pointer,
 * touch or the arrow keys scrub mission time; the arcs, the list and the
 * globe's orbits active then turn red, and the readout names who was on
 * board. At rest it reads today.
 */
export function Trajectory({
  flight,
  figure = 2,
  headingLevel = "h2",
  className,
}: {
  flight: Flight;
  figure?: number;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const [scrub, setLocal] = React.useState<number | null>(null);
  const t = scrub ?? flight.now;
  const wide = React.useMemo(() => plotFor(flight, WIDE), [flight]);
  const narrow = React.useMemo(() => plotFor(flight, NARROW), [flight]);
  const id = React.useId().replace(/[^a-zA-Z0-9-]/g, "");
  const r = readout(flight, t);
  const valueText = [r.head, r.active, r.text].filter(Boolean).join(" · ");
  const Heading = headingLevel;

  const onScrub = (next: number | null) => {
    setLocal(next);
    setScrub(next);
  };
  React.useEffect(() => () => setScrub(null), []);

  const label = "Scrub mission elapsed time, in months from launch";
  return (
    <div
      className={cn(
        "grid gap-x-6 border-t-2 border-ink pt-3 lg:grid-cols-12",
        className
      )}
    >
      <Heading className="flex flex-wrap justify-between gap-x-6 gap-y-1 label font-medium tracking-[0.06em] text-ink-soft lg:col-span-12">
        <span>
          <b className="font-semibold text-ink">Fig. {figure}</b>&nbsp;
          Trajectory. One arc per phase, height = months served
        </span>
        <span aria-hidden className="text-ink tabular-nums">
          {r.head}
          {r.active ? (
            <>
              {" · "}
              <em className="text-signal not-italic">{r.active}</em>
            </>
          ) : null}{" "}
          · {r.text}
        </span>
      </Heading>
      <div className="mt-2 min-w-0 lg:col-span-9">
        <PlotSvg
          plot={wide}
          flight={flight}
          t={t}
          id={`${id}-w`}
          label={label}
          valueText={valueText}
          onScrub={onScrub}
          className="max-md:hidden"
        />
        <PlotSvg
          plot={narrow}
          flight={flight}
          t={t}
          id={`${id}-n`}
          label={label}
          valueText={valueText}
          onScrub={onScrub}
          className="md:hidden"
        />
      </div>
      <ol
        aria-label="Mission phases"
        className="mt-5 self-end lg:col-span-3 lg:mt-0"
      >
        {flight.phases.map((phase) => {
          const on = isActive(phase, t);
          return (
            <li
              key={phase.id}
              data-on={on ? "" : undefined}
              className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 border-b border-rule py-[3px] first:border-t"
            >
              <b className="font-mono text-[0.6875rem] leading-[1.3] font-semibold text-ink-faint group-data-on:text-signal">
                {phase.code}
              </b>
              <span className="font-display text-[0.84375rem] leading-[1.15] font-bold group-data-on:text-signal">
                {phase.company}
              </span>
              <i className="font-mono text-[0.625rem] leading-[1.3] tracking-[0.04em] text-ink-faint not-italic">
                {phaseSpan(flight, phase)}
              </i>
              <small className="col-start-2 col-end-4 text-xs leading-[1.2] text-ink-soft">
                {phase.title}
              </small>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
