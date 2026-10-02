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

export function PlatesPoster() {
  return svg(
    "0 0 160 110",
    <g className={LINE}>
      <rect className="fill-sheet" x="20" y="20" width="90" height="62" />
      <rect className="fill-blue" x="34" y="28" width="90" height="62" />
      <rect className="fill-pink" x="48" y="36" width="90" height="62" />
    </g>
  );
}

export function PinsPoster() {
  return svg(
    "0 0 400 40",
    <g className={LINE}>
      <circle className="fill-ink" cx="24" cy="22" r="5" />
      <circle className="fill-ink" cx="376" cy="22" r="5" />
    </g>,
    "xMidYMid"
  );
}

export function TinsPoster({ plates }: { plates: readonly ("p1" | "p2")[] }) {
  const n = Math.max(1, plates.length);
  const step = Math.min(34, 200 / n);
  const x0 = 110 - ((n - 1) * step) / 2;
  return svg(
    "0 0 220 64",
    <g className={LINE}>
      {plates.map((plate, i) => (
        <g key={i}>
          <rect
            className="fill-shade"
            x={x0 + i * step - 12}
            y="26"
            width="24"
            height="26"
          />
          <rect
            className={plate === "p1" ? "fill-pink" : "fill-blue"}
            x={x0 + i * step - 13}
            y="21"
            width="26"
            height="6"
          />
        </g>
      ))}
    </g>
  );
}

export function BooksPoster({ count }: { count: number }) {
  return svg(
    "0 0 120 72",
    <g className={LINE}>
      {Array.from({ length: Math.max(1, count) }, (_, i) => (
        <rect
          key={i}
          className={i % 2 ? "fill-blue" : "fill-pink"}
          x={40 + i * 14}
          y="16"
          width="12"
          height="46"
        />
      ))}
      <path className="fill-none" d="M20 62h80" />
    </g>
  );
}

export function GuillotinePoster() {
  return svg(
    "0 0 64 64",
    <g className={LINE}>
      <rect className="fill-shade" x="6" y="50" width="52" height="4" />
      <rect className="fill-sheet" x="14" y="38" width="36" height="12" />
      <rect className="fill-ink" x="10" y="12" width="44" height="6" />
    </g>
  );
}

export function FoldPoster() {
  return svg(
    "0 0 160 96",
    <g className={LINE}>
      <path className="fill-sheet" d="M30 70l40-16 40 16-40 16Z" />
      <path className="fill-shade" d="M70 54l40 16 20-40-40-12Z" />
    </g>
  );
}

export function TrayPoster() {
  return svg(
    "0 0 160 72",
    <g className={LINE}>
      <path className="fill-none" d="M24 30v24h112V30" />
      <path className="fill-ink-soft" d="M24 54h112v3H24Z" />
    </g>
  );
}

export function FlagsPoster({ answered }: { answered: readonly boolean[] }) {
  const n = Math.max(1, answered.length);
  const step = Math.min(24, 140 / n);
  const x0 = 80 - ((n - 1) * step) / 2;
  return svg(
    "0 0 160 64",
    <g className={LINE}>
      <rect
        className="fill-shade"
        x={x0 - 14}
        y="54"
        width={(n - 1) * step + 28}
        height="5"
      />
      {answered.map((done, i) => (
        <g key={i}>
          <path className="fill-none" d={`M${x0 + i * step} 54V18`} />
          <rect
            className={done ? "fill-blue" : "fill-pink"}
            x={x0 + i * step}
            y="18"
            width="11"
            height="7"
          />
        </g>
      ))}
    </g>
  );
}

export function CorrectionPoster({ answered }: { answered: boolean }) {
  return svg(
    "0 0 96 96",
    <g className={LINE}>
      <rect className="fill-sheet" x="26" y="12" width="52" height="70" />
      <path
        className="fill-none stroke-ink-soft"
        d="M36 28h34M36 38h34M36 48h34M36 58h34"
      />
      <path
        className="fill-none stroke-pink [stroke-width:2.5]"
        d="M28 46l4-6 4 6"
      />
      {answered ? (
        <path
          className="fill-none stroke-blue [stroke-width:2.5]"
          d="M34 42h38"
        />
      ) : null}
    </g>
  );
}

export function RackPoster({ tests }: { tests: number }) {
  return svg(
    "0 0 400 64",
    <g className={LINE}>
      <path className="fill-none" d="M0 8h400" />
      {Array.from({ length: Math.max(1, tests) }, (_, i) => {
        const x = ((i + 0.5) / Math.max(1, tests)) * 400;
        return (
          <rect
            key={i}
            className="fill-sheet"
            x={x - 16}
            y="10"
            width="32"
            height="44"
          />
        );
      })}
    </g>,
    "none"
  );
}

export function ColourBarPoster() {
  return svg(
    "0 0 120 24",
    <g className={LINE}>
      <rect className="fill-yellow" x="12" y="14" width="22" height="6" />
      <rect className="fill-pink" x="37" y="14" width="22" height="6" />
      <rect className="fill-blue" x="62" y="14" width="22" height="6" />
      <rect className="fill-ink" x="87" y="14" width="22" height="6" />
    </g>
  );
}

/** Thrown while the experiment runs (the session pauses for its canvas then). */
export function LeverPoster() {
  return svg(
    "0 0 64 64",
    <g className={LINE}>
      <rect className="fill-shade" x="14" y="46" width="36" height="8" />
      <g className="origin-[32px_46px] -rotate-[34deg] in-[:root:has([data-stage-live])]:rotate-[34deg]">
        <path
          className="fill-none stroke-ink-soft [stroke-width:2.5]"
          d="M32 46V16"
        />
        <circle className="fill-pink" cx="32" cy="14" r="5" />
      </g>
    </g>
  );
}

export function AccentRollerPoster() {
  return svg(
    "0 0 64 64",
    <g className={LINE}>
      <rect
        className="fill-pink"
        x="12"
        y="28"
        width="40"
        height="20"
        rx="10"
      />
    </g>
  );
}

export function ChasePoster() {
  return svg(
    "0 0 96 96",
    <g className={LINE}>
      <rect
        className="fill-none stroke-ink-soft [stroke-width:6]"
        x="16"
        y="16"
        width="64"
        height="64"
      />
      <rect className="fill-shade" x="26" y="34" width="36" height="22" />
      <path className="fill-pink" d="M64 36h10v8H62ZM62 48h12v8H64Z" />
    </g>
  );
}

export function TargetPoster() {
  return svg(
    "0 0 96 96",
    <g className="fill-none [stroke-width:3]">
      <circle className="stroke-yellow" cx="48" cy="48" r="28" />
      <circle className="stroke-pink" cx="48" cy="48" r="28" />
      <circle className="stroke-blue" cx="48" cy="48" r="28" />
    </g>
  );
}

export function BallPoster() {
  return svg(
    "0 0 400 120",
    <g className={LINE}>
      <path className="fill-ink-soft" d="M340 60h44l-6 56h-32Z" />
      <circle className="fill-sheet" cx="362" cy="62" r="14" />
    </g>,
    "xMaxYMax"
  );
}

export function TargetsPoster() {
  return svg(
    "0 0 400 48",
    <g className="fill-none [stroke-width:1.5]">
      {[0, 1, 2, 3, 4].map((t) => {
        const x = 40 + t * 80;
        return (
          <g key={t}>
            <circle className="stroke-yellow" cx={x - 5} cy="22" r="10" />
            <circle className="stroke-pink" cx={x + 4} cy="27" r="10" />
            <circle className="stroke-blue" cx={x} cy="20" r="10" />
          </g>
        );
      })}
    </g>,
    "xMidYMid"
  );
}
