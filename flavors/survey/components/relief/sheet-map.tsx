"use client";

import * as React from "react";
import Link from "next/link";
import { SceneLoader } from "@/flavors/survey/components/scene/scene-loader";
import { aimLoupe, onLoupe, restLoupe } from "@/flavors/survey/lib/loupe";
import {
  isoMonth,
  labelBox,
  monthLabel,
  readout,
  screenY,
  SHEET,
  type Relief,
  type Site,
} from "@/flavors/survey/lib/relief";
import { FULL_SHEET, type Focus } from "@/flavors/survey/lib/scene/poses";
import { cn } from "@/flavors/survey/lib/utils";

import { formatMonthYear } from "@/lib/format";

const { X0, X1, Y0, P, YS, ROW } = SHEET;
const Y1 = Y0 + P * YS;
const halo = "halo";
const label = cn(
  halo,
  "fill-ink font-display text-[11px] tracking-[0.22em] max-md:text-[16px] max-md:tracking-[0.1em]"
);
const number = cn(
  halo,
  "fill-ink font-sans text-[10.5px] font-semibold tabular-nums max-md:text-[14px]"
);
const note = cn(
  halo,
  "fill-ink-soft font-serif text-[12.5px] italic max-md:text-[16px]"
);
const grid =
  "fill-water font-sans text-[10px] font-medium tabular-nums tracking-[0.04em] max-md:text-[14px]";

const statusNote: Partial<Record<Site["status"], string>> = {
  archived: "(site of)",
  wip: "under construction",
};

function SiteSymbol({ site }: { site: Site }) {
  const { x } = site;
  const y = screenY(site.p);
  if (site.status === "archived") {
    return (
      <path
        d={`M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`}
        className="stroke-ink"
        strokeWidth="1.1"
      />
    );
  }
  if (site.status === "wip") {
    return (
      <rect
        x={x - 5.5}
        y={y - 5.5}
        width="11"
        height="11"
        className="fill-none stroke-ink"
        strokeWidth="1.1"
        strokeDasharray="2.5 1.8"
      />
    );
  }
  return (
    <>
      <path
        d={`M${x} ${y - 6.5}L${x + 6.5} ${y + 4.5}H${x - 6.5}Z`}
        className={
          site.status === "active" ? "fill-ink" : "fill-none stroke-ink"
        }
        strokeWidth="1.1"
      />
      <circle
        cx={x}
        cy={y + 0.8}
        r="1.3"
        className={site.status === "active" ? "fill-sheet" : "fill-ink"}
      />
    </>
  );
}

/**
 * The hero sheet. Under the lettering sits the ground: its flat drawing (the
 * poster, `children`) and, once WebGL is ready, the relief mesh on the same
 * oblique. Over it, real links: every summit (a role) and every site (a
 * project). The loupe follows the pointer, magnifies the relief and reads
 * out the month, the grid square and how many roles were running. Pointing
 * at a summit or site sends the loupe to it.
 */
export function SheetMap({
  relief,
  board,
  focus,
  children,
}: {
  relief: Relief;
  /** The scene board for this page (see `encodeBoard`). */
  board: string;
  focus: Focus;
  children: React.ReactNode;
}) {
  const svg = React.useRef<SVGSVGElement>(null);
  const lens = React.useRef<SVGGElement>(null);
  const where = React.useRef<SVGTextElement>(null);
  const what = React.useRef<SVGTextElement>(null);
  const titleId = React.useId();
  const descId = React.useId();
  const rest = readout(relief, focus.x, focus.p);

  React.useEffect(
    () =>
      onLoupe((x, p) => {
        lens.current?.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${screenY(p).toFixed(1)})`
        );
        const text = readout(relief, x, p);
        const right = x < SHEET.W * 0.72;
        for (const [el, value] of [
          [where.current, text.where],
          [what.current, text.what],
        ] as const) {
          if (!el) continue;
          el.textContent = value;
          el.setAttribute("x", right ? "92" : "-92");
          el.setAttribute("text-anchor", right ? "start" : "end");
        }
      }),
    [relief]
  );

  const aimAt = (event: React.PointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest("a")) return;
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      ctm.inverse()
    );
    aimLoupe(
      Math.max(X0, Math.min(X1, point.x)),
      Math.max(0, Math.min(P, (point.y - Y0) / YS))
    );
  };

  const years = Array.from({ length: relief.to - relief.from }, (_, i) => ({
    year: relief.from + i,
    x: X0 + i * relief.yearW,
  }));
  const northings = [10, 8, 6, 5, 4, 2, 0];

  return (
    <div
      data-scene-slot
      data-scene-route="home"
      data-scene-board={board}
      className="relative"
    >
      <div
        data-scene-poster
        aria-hidden
        className="absolute inset-0 transition-opacity duration-(--duration-ui)"
      >
        <svg viewBox={`0 0 ${SHEET.W} ${SHEET.H}`} className="block size-full">
          {children}
        </svg>
      </div>
      <SceneLoader
        route="home"
        window={FULL_SHEET}
        focus={focus}
        interactive={false}
      />
      <svg
        ref={svg}
        viewBox={`0 0 ${SHEET.W} ${SHEET.H}`}
        role="group"
        aria-labelledby={`${titleId} ${descId}`}
        data-cursor="none"
        onPointerMove={aimAt}
        onPointerDown={aimAt}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") restLoupe();
        }}
        className="relative block h-auto w-full touch-pan-y select-none"
      >
        <title id={titleId}>
          {`Career survey sheet, ${relief.from} to ${formatMonthYear(isoMonth(relief.today))}`}
        </title>
        <desc id={descId}>
          Relief map. Each hill is a role; its height is the months spent in it,
          with a contour every {SHEET.INTERVAL} months. One grid square east is
          one calendar year. North of the dashed boundary is employment, south
          is own work, where projects are marked as surveyed sites. East of
          today is unsurveyed.
        </desc>

        <rect
          x={X0}
          y={Y0}
          width={X1 - X0}
          height={Y1 - Y0}
          className="fill-none stroke-ink"
          strokeWidth="0.9"
          aria-hidden
        />
        <text
          aria-hidden
          className={cn(
            halo,
            "fill-water [stroke:var(--color-sea)] font-serif text-[13px] tracking-[0.12em] italic max-md:text-[16px]"
          )}
          transform={`translate(${(relief.coast + X1) / 2 + 4} ${screenY(SHEET.BOUNDARY)}) rotate(90)`}
          textAnchor="middle"
        >
          Unsurveyed beyond {formatMonthYear(isoMonth(relief.today))}
        </text>

        <g
          aria-hidden
          className="fill-ink-soft font-display text-[13px] tracking-[0.62em] max-md:text-[17px] max-md:tracking-[0.4em]"
        >
          <text
            x={X0 + relief.yearW * 1.05}
            y={screenY(ROW * 2.3)}
            textAnchor="middle"
          >
            EMPLOYMENT
          </text>
          <text
            x={(X0 + relief.coast) / 2}
            y={screenY(ROW * 8.6)}
            textAnchor="middle"
          >
            OWN WORK
          </text>
        </g>

        <g
          ref={lens}
          aria-hidden
          transform={`translate(${focus.x} ${screenY(focus.p)})`}
        >
          <ellipse
            rx="80"
            ry="72"
            className="fill-none stroke-ink"
            strokeWidth="0.9"
          />
          <ellipse
            rx="84"
            ry="76"
            className="fill-none stroke-ink opacity-50"
            strokeWidth="0.4"
          />
          <path
            d="M0 -76V-66M0 66V76M-84 0H-74M74 0H84M-5 0H5M0 -5V5"
            className="stroke-ink"
            strokeWidth="0.9"
          />
          <text
            ref={where}
            x="92"
            y="-4"
            className={cn(
              halo,
              "fill-ink font-sans text-[10.5px] font-semibold tracking-[0.1em] tabular-nums max-md:text-[15px]"
            )}
          >
            {rest.where}
          </text>
          <text
            ref={what}
            x="92"
            y="14"
            className={cn(
              halo,
              "fill-ink font-serif text-[14px] italic max-md:text-[19px]"
            )}
          >
            {rest.what}
          </text>
        </g>

        {relief.summits.map((s) => {
          const y = screenY(s.p, s.h);
          const box = labelBox(s);
          return (
            <Link
              key={s.id}
              href={`/work#${s.id}`}
              data-scene-item={`role:${s.id}`}
              aria-label={`${s.company}, ${s.title}, ${monthLabel(s.start)} to ${s.current ? "now" : monthLabel(s.end)}, ${s.h} months${s.current ? " and counting" : ""}`}
              onPointerEnter={() => aimLoupe(s.x, s.p)}
              onFocus={() => aimLoupe(s.x, s.p)}
              className="group outline-none"
            >
              <circle
                cx={s.x}
                cy={y}
                r="1.8"
                className={s.current ? "fill-revision" : "fill-ink"}
              />
              <text
                x={s.x}
                y={y + (s.label === "above" ? -11 : 19)}
                textAnchor="middle"
                className={cn(
                  label,
                  s.current && "fill-revision",
                  "group-hover:fill-water group-focus-visible:fill-water"
                )}
              >
                {s.company.toUpperCase()}
              </text>
              <text
                x={s.x + 5}
                y={y + 4}
                className={cn(number, s.current && "fill-revision")}
              >
                {s.h}
              </text>
              {s.current ? (
                <text
                  x={s.x}
                  y={y + 19}
                  textAnchor="middle"
                  className={cn(note, "fill-revision")}
                >
                  still rising
                </text>
              ) : null}
              <rect
                x={box.x0 - 4}
                y={Math.min(box.y0, y - 4) - 4}
                width={box.x1 - box.x0 + 8}
                height={Math.max(box.y1, y + 6) - Math.min(box.y0, y - 4) + 8}
                // Transparent fill: the name and the summit are one pointer target; the stroke is the focus ring.
                className="fill-transparent stroke-water [stroke-opacity:0] group-focus-visible:[stroke-opacity:1]"
                strokeWidth="1.5"
              />
            </Link>
          );
        })}

        {relief.sites.map((site) => {
          const y = screenY(site.p);
          const tag = statusNote[site.status];
          const gothic = site.status === "archived";
          return (
            <Link
              key={site.id}
              href={`/projects/${site.slug}`}
              data-scene-item={`site:${site.slug}`}
              aria-label={`${site.name}, ${site.year}, ${site.status === "wip" ? "in progress" : site.status}`}
              onPointerEnter={() => aimLoupe(site.x, site.p)}
              onFocus={() => aimLoupe(site.x, site.p)}
              className="group outline-none"
            >
              <circle cx={site.x} cy={y} r="14" className="fill-transparent" />
              <SiteSymbol site={site} />
              <g
                className={cn(
                  !site.featured &&
                    "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                )}
              >
                <text
                  x={site.x + 11}
                  y={y + 4.5}
                  className={cn(
                    halo,
                    "fill-ink group-hover:fill-water group-focus-visible:fill-water",
                    gothic
                      ? "font-gothic text-[16px] max-md:text-[21px]"
                      : "font-serif text-[14px] max-md:text-[19px]"
                  )}
                >
                  {site.name}
                </text>
                {tag ? (
                  <text x={site.x + 11} y={y + 19} className={note}>
                    {tag}
                  </text>
                ) : null}
              </g>
              <rect
                x={site.x - 9}
                y={y - 10}
                width="18"
                height="18"
                className="fill-none stroke-water opacity-0 group-focus-visible:opacity-100"
                strokeWidth="1.5"
              />
            </Link>
          );
        })}

        <g aria-hidden>
          {years.map(({ year, x }) => (
            <text key={year} x={x + 4} y={Y1 + 28} className={grid}>
              {year}
            </text>
          ))}
          <text
            x={relief.coast}
            y={Y1 + 28}
            textAnchor="middle"
            className={cn(grid, "fill-revision")}
          >
            {monthLabel(relief.today)}
          </text>
          <g textAnchor="end">
            {northings.map((n) => (
              <text
                key={n}
                x={X0 - 7}
                y={screenY((10 - n) * ROW) + 3}
                className={cn(grid, n === 5 && "fill-ink-soft")}
              >
                {String(n).padStart(2, "0")}
              </text>
            ))}
          </g>
          <g transform={`translate(${X0} ${SHEET.H - 30})`}>
            <rect
              width={relief.yearW}
              height="5"
              className="fill-none stroke-ink"
              strokeWidth="0.8"
            />
            <rect width={relief.yearW / 4} height="5" className="fill-ink" />
            <rect
              x={relief.yearW / 2}
              width={relief.yearW / 4}
              height="5"
              className="fill-ink"
            />
            <text y="20" className={cn(grid, "fill-ink-soft")}>
              0
            </text>
            <text
              x={relief.yearW / 2}
              y="20"
              textAnchor="middle"
              className={cn(grid, "fill-ink-soft")}
            >
              6
            </text>
            <text
              x={relief.yearW}
              y="20"
              textAnchor="middle"
              className={cn(grid, "fill-ink-soft")}
            >
              12 MONTHS
            </text>
          </g>
          <text
            x={X1}
            y={SHEET.H - 24}
            textAnchor="end"
            className={cn(grid, "fill-ink-soft max-md:hidden")}
          >
            CONTOUR INTERVAL {SHEET.INTERVAL} MONTHS · HEIGHTS IN MONTHS IN ROLE
          </text>
          <g
            transform={`translate(${X1 + 20} 118)`}
            className="stroke-ink"
            strokeWidth="0.9"
          >
            <path d="M0 0V-38" />
            <path d="M0 -38L-4 -26H0Z" className="fill-ink" />
            <text
              y="-44"
              textAnchor="middle"
              stroke="none"
              className={cn(grid, "fill-ink")}
            >
              N
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
