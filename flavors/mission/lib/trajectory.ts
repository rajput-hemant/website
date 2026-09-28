import { monthLabel, type Flight, type Phase } from "./flight";

/**
 * Fig. 2, the trajectory plot, as geometry. Each phase is a transfer arc
 * from its start to its end month, as high as the months it lasted; the one
 * still in flight climbs to today and runs on as a dotted line. Pre-launch
 * is a hatched, compressed band at the left. Pure, in plot pixels, so the
 * server draws it and the client only moves the cursor.
 */

export type PlotSize = {
  width: number;
  height: number;
  /** Width of the compressed pre-launch band. */
  gutter: number;
  /** Label every 3rd month, or only every 6th. */
  compact: boolean;
};

export const WIDE: PlotSize = {
  width: 960,
  height: 224,
  gutter: 70,
  compact: false,
};
export const NARROW: PlotSize = {
  width: 358,
  height: 212,
  gutter: 30,
  compact: true,
};

export type Arc = {
  phase: Phase;
  /** Peak height above the axis. */
  h: number;
  d: string;
  /** The dotted run-on of the phase still in flight. */
  cont: string | null;
  label: { x: number; y: number };
};

export type Plot = {
  size: PlotSize;
  base: number;
  /** First month of the pre-launch band (negative), 0 without one. */
  tg: number;
  /** Months the axis spans after T-0. */
  tm: number;
  x0: number;
  x1: number;
  nowX: number;
  arcs: Arc[];
  ticks: { x: number; major: boolean; label: string | null }[];
};

const f = (n: number) => Math.round(n * 100) / 100;

export function plotFor(flight: Flight, size: PlotSize): Plot {
  const tg = flight.pre ? Math.min(0, flight.pre.from * 12 - flight.t0) : 0;
  const g = tg < 0 ? size.gutter : 0;
  const base = size.height - 24;
  const x0 = g ? g + 12 : 0;
  const x1 = size.width - 6;
  const tm = Math.ceil(flight.now) + 3;
  const X = (t: number) =>
    t < 0 ? (g * (t - tg)) / -tg : x0 + ((x1 - x0) * t) / tm;
  const longest = Math.max(1, ...flight.phases.map((p) => p.dur));
  const k = (base - 44) / longest;
  const nowX = X(flight.now);

  const arcs = flight.phases.map((phase): Arc => {
    const xa = X(phase.a);
    const h = k * phase.dur;
    if (phase.b !== null) {
      const xb = X(phase.b);
      const rx = (xb - xa) / 2;
      return {
        phase,
        h,
        d: `M${f(xa)} ${base}A${f(rx)} ${f(h)} 0 0 1 ${f(xb)} ${base}`,
        cont: null,
        label: { x: f(xa + rx), y: f(base - h - 6) },
      };
    }
    return {
      phase,
      h,
      d: `M${f(xa)} ${base}A${f(nowX - xa)} ${f(h)} 0 0 1 ${f(nowX)} ${f(base - h)}`,
      cont: `M${f(nowX)} ${f(base - h)}H${x1}`,
      label: { x: f(nowX), y: f(base - h - 8) },
    };
  });

  const ticks: Plot["ticks"] = [];
  for (let t = 0; t <= tm - 1; t++) {
    const major = t % 3 === 0;
    ticks.push({
      x: f(X(t)),
      major,
      label:
        t === 0
          ? "T-0"
          : major && (!size.compact || t % 6 === 0)
            ? monthLabel(flight, t)
            : null,
    });
  }

  return { size, base, tg, tm, x0, x1, nowX: f(nowX), arcs, ticks };
}

/** Plot x of a time, the inverse of {@link timeAt}. */
export function xAt(plot: Plot, t: number) {
  const g = plot.tg < 0 ? plot.size.gutter : 0;
  return t < 0
    ? (g * (t - plot.tg)) / -plot.tg
    : plot.x0 + ((plot.x1 - plot.x0) * t) / plot.tm;
}

/** The time under plot x `px`, clamped to the flight. */
export function timeAt(plot: Plot, px: number, now: number) {
  const g = plot.tg < 0 ? plot.size.gutter : 0;
  const t =
    px < g
      ? plot.tg + (-plot.tg * px) / g
      : px < plot.x0
        ? 0
        : ((px - plot.x0) / (plot.x1 - plot.x0)) * plot.tm;
  return Math.max(plot.tg, Math.min(now, t));
}

/** Height of a phase's arc at time `t`, for the cursor dot. */
export function yOn(plot: Plot, arc: Arc, t: number, now: number) {
  const { phase, h: top } = arc;
  const x = xAt(plot, t);
  const xa = xAt(plot, phase.a);
  if (phase.b !== null) {
    const xb = xAt(plot, phase.b);
    const rx = (xb - xa) / 2;
    const dx = (x - xa - rx) / rx;
    return plot.base - top * Math.sqrt(Math.max(0, 1 - dx * dx));
  }
  const xn = xAt(plot, now);
  if (x >= xn) return plot.base - top;
  const q = (x - xn) / (xn - xa);
  return plot.base - top * Math.sqrt(Math.max(0, 1 - q * q));
}
