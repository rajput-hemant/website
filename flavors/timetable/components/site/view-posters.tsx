/**
 * Static drawings for the in-page views: what each placeholder shows before
 * the scene is live and on T0. Each fills its placeholder's box.
 */

const TAU = Math.PI * 2;

/** The station clock at ten past ten, the seconds hand at twelve. */
export function ClockPoster() {
  const ticks = Array.from({ length: 12 }, (_, i) => (i / 12) * TAU);
  const hand = (turn: number, length: number, width: number) => (
    <line
      x1="50"
      y1="50"
      x2={50 + Math.sin(turn * TAU) * length}
      y2={50 - Math.cos(turn * TAU) * length}
      strokeWidth={width}
      className="stroke-[#14191e]"
    />
  );
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle cx="50" cy="50" r="46" className="fill-[#1b2025]" />
      <circle cx="50" cy="50" r="42" className="fill-[#f4f6f7]" />
      {ticks.map((a) => (
        <line
          key={a}
          x1={50 + Math.sin(a) * 31}
          y1={50 - Math.cos(a) * 31}
          x2={50 + Math.sin(a) * 38}
          y2={50 - Math.cos(a) * 38}
          strokeWidth="3.5"
          className="stroke-[#14191e]"
        />
      ))}
      {hand(10 / 12 + 10 / 720, 24, 5)}
      {hand(10 / 60, 35, 3.5)}
      <line
        x1="50"
        y1="58"
        x2="50"
        y2="20"
        strokeWidth="1.5"
        className="stroke-signal"
      />
      <circle cx="50" cy="26" r="5" className="fill-signal" />
    </svg>
  );
}

/** A three-aspect signal head showing green. */
export function SignalPoster() {
  return (
    <svg viewBox="0 0 60 120" className="size-full">
      <rect x="12" y="6" width="36" height="108" rx="6" className="fill-ink" />
      <circle cx="30" cy="28" r="11" className="fill-line-4" />
      <circle cx="30" cy="60" r="11" className="fill-[#2a3036]" />
      <circle cx="30" cy="92" r="11" className="fill-[#2a3036]" />
    </svg>
  );
}

/** A plain enamel roundel. */
export function RoundelPoster() {
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle cx="50" cy="50" r="30" className="fill-ink-faint" />
      <circle
        cx="50"
        cy="50"
        r="30"
        strokeWidth="3"
        className="fill-none stroke-ink"
      />
    </svg>
  );
}
