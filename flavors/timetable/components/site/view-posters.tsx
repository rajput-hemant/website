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

/** An Edmondson card ticket, unpunched. */
export function TicketPoster() {
  return (
    <svg viewBox="0 0 120 80" className="size-full">
      <rect
        x="14"
        y="16"
        width="92"
        height="48"
        rx="4"
        className="fill-[#efe4c8]"
      />
      <rect x="14" y="24" width="92" height="10" className="fill-signal" />
    </svg>
  );
}

/** The wayfinding pylon on its guide face. */
export function PylonPoster() {
  return (
    <svg viewBox="0 0 60 120" className="size-full">
      <rect x="16" y="6" width="28" height="108" className="fill-[#14191e]" />
      <rect x="16" y="12" width="28" height="4" className="fill-signal" />
      <rect x="21" y="28" width="18" height="14" rx="2" className="fill-cell" />
    </svg>
  );
}

/** Milestone posts at rest, one per entry. */
export function PostsPoster({ count }: { count: number }) {
  const n = Math.max(1, count);
  return (
    <svg viewBox={`0 0 ${n * 24 + 8} 60`} className="size-full">
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect
            x={i * 24 + 12}
            y="12"
            width="8"
            height="44"
            className="fill-ink"
          />
          <rect
            x={i * 24 + 11}
            y="16"
            width="10"
            height="5"
            className="fill-ink-faint"
          />
        </g>
      ))}
    </svg>
  );
}

/** The year drum, current year to the front. */
export function DrumPoster() {
  return (
    <svg viewBox="0 0 120 60" className="size-full">
      <rect
        x="8"
        y="10"
        width="104"
        height="40"
        rx="6"
        className="fill-board"
      />
      <rect x="8" y="26" width="104" height="8" className="fill-cell" />
    </svg>
  );
}

/** The information desk's "i" sign on its rods. */
export function InfoPoster() {
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <line
        x1="38"
        y1="0"
        x2="38"
        y2="40"
        strokeWidth="2"
        className="stroke-ink"
      />
      <line
        x1="62"
        y1="0"
        x2="62"
        y2="40"
        strokeWidth="2"
        className="stroke-ink"
      />
      <rect
        x="28"
        y="40"
        width="44"
        height="44"
        rx="6"
        className="fill-line-3"
      />
      <circle cx="50" cy="52" r="4" className="fill-white" />
      <rect x="46.5" y="59" width="7" height="18" className="fill-white" />
    </svg>
  );
}

/** The turntable deck, pointing straight. */
export function ValidatorPoster() {
  return (
    <svg viewBox="0 0 48 44" className="size-full">
      <rect x="10" y="6" width="26" height="30" rx="3" className="fill-sign" />
      <rect x="15" y="12" width="16" height="3" className="fill-signal" />
      <rect x="8" y="35" width="34" height="4" rx="1.5" className="fill-sign" />
    </svg>
  );
}

export function TurntablePoster() {
  return (
    <svg viewBox="0 0 200 80" className="size-full">
      <ellipse cx="100" cy="42" rx="92" ry="30" className="fill-cell-deep" />
      <ellipse cx="100" cy="40" rx="84" ry="26" className="fill-[#3a4148]" />
      <rect x="18" y="35" width="164" height="3" className="fill-[#c9ced3]" />
      <rect x="18" y="43" width="164" height="3" className="fill-[#c9ced3]" />
    </svg>
  );
}

/** The ticket printer, idle. */
export function PrinterPoster() {
  return (
    <svg viewBox="0 0 80 60" className="size-full">
      <rect x="18" y="26" width="44" height="26" rx="3" className="fill-ink" />
      <rect x="26" y="24" width="28" height="3" className="fill-ink-faint" />
    </svg>
  );
}

/** The lever frame, every lever normal. */
export function LeversPoster() {
  const colours = ["fill-line-1", "fill-ink", "fill-line-3"];
  return (
    <svg viewBox="0 0 120 100" className="size-full">
      {colours.map((c, i) => (
        <rect
          key={c}
          x={34 + i * 22}
          y="18"
          width="8"
          height="62"
          className={c}
        />
      ))}
      <rect x="18" y="78" width="84" height="12" className="fill-[#20252a]" />
    </svg>
  );
}

/** The carriage at rest before the buffer stop. */
export function BufferPoster() {
  return (
    <svg viewBox="0 0 320 90" className="size-full">
      <rect x="10" y="70" width="300" height="4" className="fill-[#9aa4ad]" />
      <rect x="60" y="34" width="96" height="34" rx="2" className="fill-ink" />
      <circle cx="58" cy="58" r="4" className="fill-danger" />
      <rect x="262" y="30" width="12" height="40" className="fill-line-1" />
    </svg>
  );
}
