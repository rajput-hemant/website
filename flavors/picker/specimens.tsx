import type { FlavorMeta, LiveFlavorId } from "@/flavors/registry";

type Swatch = FlavorMeta["swatch"];

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const CONDENSED =
  "'Archivo Narrow', 'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

const svgProps = {
  "aria-hidden": true,
  focusable: false,
  className: "block h-auto w-full",
} as const;

/** A paper page: serif display, hairline rules and an index of rows. */
function MinimalSpecimen({ ground, ink, accent }: Swatch) {
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text x="32" y="40" fill={ink} fontFamily={SERIF} fontSize="15">
        hemant
      </text>
      <g fill={ink} opacity="0.42">
        <rect x="262" y="32" width="22" height="3" rx="1.5" />
        <rect x="296" y="32" width="30" height="3" rx="1.5" />
        <rect x="338" y="32" width="30" height="3" rx="1.5" />
      </g>
      <line
        x1="32"
        x2="368"
        y1="58"
        y2="58"
        stroke={ink}
        strokeOpacity="0.12"
      />
      <text
        x="31"
        y="108"
        fill={ink}
        fontFamily={SERIF}
        fontSize="34"
        letterSpacing="-0.6"
      >
        Quiet pages,
      </text>
      <text
        x="31"
        y="144"
        fill={ink}
        fontFamily={SERIF}
        fontSize="34"
        letterSpacing="-0.6"
      >
        the work{" "}
        <tspan fill={accent} fontStyle="italic">
          first.
        </tspan>
      </text>
      <g fill={ink} opacity="0.26">
        <rect x="32" y="164" width="236" height="3" rx="1.5" />
        <rect x="32" y="173" width="188" height="3" rx="1.5" />
      </g>
      {[200, 224, 248].map((y, i) => (
        <g key={y}>
          <line
            x1="32"
            x2="368"
            y1={y - 10}
            y2={y - 10}
            stroke={ink}
            strokeOpacity="0.12"
          />
          <circle
            cx="36"
            cy={y + 1.5}
            r="3"
            fill={i === 0 ? accent : ink}
            opacity={i === 0 ? 1 : 0.28}
          />
          <rect
            x="48"
            y={y}
            width={[132, 104, 118][i]}
            height="3"
            rx="1.5"
            fill={ink}
            opacity="0.62"
          />
          <rect
            x="342"
            y={y}
            width="26"
            height="3"
            rx="1.5"
            fill={ink}
            opacity="0.3"
          />
        </g>
      ))}
    </svg>
  );
}

/** A drawing sheet: gridded frame, an isometric plan chest, a title block. */
function DrawingSetSpecimen({ ground, ink, accent }: Swatch) {
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <defs>
        <pattern
          id="picker-ds-grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0H0V20" fill="none" stroke={ink} strokeOpacity="0.07" />
        </pattern>
      </defs>
      <rect width="400" height="280" fill={ground} />
      <rect
        x="10.5"
        y="10.5"
        width="379"
        height="259"
        fill="url(#picker-ds-grid)"
        stroke={ink}
        strokeOpacity="0.35"
      />
      <g stroke={ink} strokeOpacity="0.35">
        {Array.from({ length: 18 }, (_, i) => (
          <line
            key={i}
            x1={30 + i * 20}
            x2={30 + i * 20}
            y1="10"
            y2={i % 5 === 0 ? 18 : 15}
          />
        ))}
      </g>
      <text
        x="24"
        y="36"
        fill={ink}
        fontFamily={CONDENSED}
        fontStretch="condensed"
        fontSize="12"
        fontWeight="700"
        letterSpacing="1.4"
      >
        HEMANT RAJPUT
      </text>
      <text
        x="376"
        y="35"
        fill={ink}
        fillOpacity="0.6"
        fontFamily={MONO}
        fontSize="8"
        letterSpacing="0.8"
        textAnchor="end"
      >
        SHEET 01 / 06
      </text>
      <line
        x1="10"
        x2="390"
        y1="46"
        y2="46"
        stroke={ink}
        strokeOpacity="0.35"
      />

      <g fill={ground} stroke={ink} strokeWidth="1.1" strokeLinejoin="round">
        <path d="M170 152 256.6 102 196 67 109.4 117Z" />
        <path d="M170 212 256.6 162 256.6 102 170 152Z" />
        <path d="M170 212 109.4 177 109.4 117 170 152Z" />
      </g>
      <g stroke={ink} strokeOpacity="0.45" strokeDasharray="3 3">
        <path d="M196 127 256.6 162M196 127 109.4 177M196 127V67" />
      </g>
      <path d="M170 192 256.6 142" stroke={ink} strokeOpacity="0.8" />
      <path d="M170 172 256.6 122" stroke={accent} strokeWidth="1.8" />

      <g stroke={accent} fill="none">
        <path d="M92 117V177M87 117h10M87 177h10" />
      </g>
      <text
        x="84"
        y="150"
        fill={accent}
        fontFamily={MONO}
        fontSize="8"
        textAnchor="middle"
        transform="rotate(-90 84 150)"
      >
        600
      </text>

      <circle cx="214" cy="147" r="2.5" fill={accent} />
      <path
        d="M214 147 290 92h24"
        fill="none"
        stroke={ink}
        strokeOpacity="0.7"
      />
      <text
        x="294"
        y="87"
        fill={ink}
        fillOpacity="0.75"
        fontFamily={MONO}
        fontSize="7.5"
        letterSpacing="0.6"
      >
        DRAWER 02
      </text>

      <g stroke={ink} strokeOpacity="0.5" fill="none">
        <rect x="286.5" y="220.5" width="94" height="40" />
        <path d="M286.5 235.5h94M332.5 235.5v25" />
      </g>
      <text
        x="292"
        y="231"
        fill={ink}
        fontFamily={CONDENSED}
        fontStretch="condensed"
        fontSize="8"
        fontWeight="700"
        letterSpacing="1"
      >
        PLAN CHEST
      </text>
      <text x="292" y="252" fill={accent} fontFamily={MONO} fontSize="9">
        A-01
      </text>
      <text
        x="338"
        y="252"
        fill={ink}
        fillOpacity="0.75"
        fontFamily={MONO}
        fontSize="9"
      >
        1:20
      </text>
    </svg>
  );
}

export const liveSpecimens: Record<
  LiveFlavorId,
  (swatch: Swatch) => React.ReactNode
> = {
  minimal: MinimalSpecimen,
  "drawing-set": DrawingSetSpecimen,
};

/** A generic page in an unbuilt edition's palette. */
export function FutureSpecimen({ ground, ink, accent }: Swatch) {
  return (
    <svg viewBox="0 0 160 96" {...svgProps}>
      <rect width="160" height="96" fill={ground} />
      <rect x="14" y="16" width="46" height="5" rx="1" fill={ink} />
      <g fill={ink} opacity="0.35">
        <rect x="14" y="30" width="82" height="2.5" rx="1" />
        <rect x="14" y="37" width="64" height="2.5" rx="1" />
        <rect x="14" y="44" width="72" height="2.5" rx="1" />
      </g>
      <circle cx="122" cy="46" r="20" fill={accent} />
      <circle
        cx="122"
        cy="46"
        r="27"
        fill="none"
        stroke={ink}
        strokeOpacity="0.3"
      />
      <line
        x1="14"
        x2="146"
        y1="80.5"
        y2="80.5"
        stroke={ink}
        strokeOpacity="0.25"
      />
      <rect
        x="14"
        y="70"
        width="28"
        height="2.5"
        rx="1"
        fill={ink}
        opacity="0.6"
      />
    </svg>
  );
}
