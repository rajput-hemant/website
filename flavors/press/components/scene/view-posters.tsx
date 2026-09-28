import type * as React from "react";

/**
 * The press views drawn flat: each is its view's poster until the view has
 * drawn, and the whole element on tier 0. Server-rendered, aria-hidden (the
 * placeholder is), in the page's own inks.
 */

const svg = (
  viewBox: string,
  children: React.ReactNode,
  align = "xMidYMid"
) => (
  <svg
    viewBox={viewBox}
    aria-hidden
    focusable="false"
    preserveAspectRatio={`${align} meet`}
    className="block h-full w-full overflow-visible"
  >
    {children}
  </svg>
);

const LINE = "stroke-ink [stroke-width:1.2] [stroke-linejoin:round]";

/** Home: a halftone disc, the loupe parked over the rows. */
export function LoupePoster({ at = "62%" }: { at?: string }) {
  return (
    <span
      className="absolute left-1/2 size-11 -translate-1/2 rounded-full border-[3px] border-ink"
      style={{
        top: at,
        background:
          "radial-gradient(circle, var(--color-pink) 32%, transparent 36%) 0 0 / 5px 5px, radial-gradient(circle, var(--color-blue) 32%, transparent 36%) 2px 2px / 5px 5px, var(--color-sheet)",
      }}
    />
  );
}

export function StampPoster() {
  return svg(
    "0 0 64 64",
    <g className={LINE}>
      <path className="fill-shade" d="M27 10h10l3 26H24Z" />
      <circle className="fill-ink-soft" cx="32" cy="10" r="7" />
      <rect className="fill-blue" x="14" y="36" width="36" height="9" />
    </g>
  );
}

export function SignaturesPoster({ solid }: { solid: readonly boolean[] }) {
  const n = Math.max(1, solid.length);
  const step = Math.min(14, 300 / n);
  const x0 = 160 - ((n - 1) * step) / 2;
  return svg(
    "0 0 320 64",
    <g className={LINE}>
      {solid.map((s, i) => (
        <path
          key={i}
          className={s ? "fill-blue" : "fill-shade"}
          d={`M${x0 + i * step - 4} 58V14l8-4v44Z`}
        />
      ))}
    </g>
  );
}

export function PadPoster() {
  return svg(
    "0 0 48 48",
    <g className={LINE}>
      <rect className="fill-shade" x="5" y="30" width="38" height="8" />
      <rect className="fill-blue" x="9" y="28" width="30" height="3" />
      <path className="fill-shade" d="M22 26h16v-5H22Z" />
      <path className="fill-ink-soft" d="M28 21h4l1-13h-6Z" />
    </g>
  );
}

export function RollerPoster() {
  return svg(
    "0 0 400 40",
    <g className={LINE}>
      <circle className="fill-pink" cx="14" cy="30" r="8" />
      <path className="fill-none" d="M14 30 4 12" />
    </g>,
    "xMinYMid"
  );
}

export function PilePoster({ runs }: { runs: number }) {
  const n = Math.max(1, runs);
  const h = 44 / n;
  return svg(
    "0 0 96 64",
    <g className={LINE}>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className={i % 2 ? "fill-shade" : "fill-sheet"}
          x="24"
          y={10 + i * h}
          width="56"
          height={h}
        />
      ))}
      <path className="fill-pink" d="M8 6l10 4-10 4Z" />
    </g>
  );
}

export function FountainPoster({ items }: { items: number }) {
  const level = Math.max(2, Math.min(1, items / 6) * 16);
  return svg(
    "0 0 96 48",
    <g className={LINE}>
      <rect className="fill-shade" x="8" y="18" width="80" height="22" />
      <rect
        className="fill-yellow"
        x="11"
        y={40 - level}
        width="74"
        height={level - 2}
      />
      <path className="fill-ink-soft" d="M30 16l44 4v2l-44-4Z" />
      <path className="fill-none" d="M10 13l20 3" />
    </g>
  );
}

export function YearsPoster({ years }: { years: number }) {
  const n = Math.max(1, years);
  return svg(
    "0 0 96 96",
    <g className={LINE}>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className={
            i === 0 ? "fill-yellow" : i % 2 ? "fill-shade" : "fill-sheet"
          }
          x="30"
          y="30"
          width="40"
          height="54"
          transform={`rotate(${-60 + (60 * (n - i)) / n} 30 84)`}
        />
      ))}
    </g>
  );
}
