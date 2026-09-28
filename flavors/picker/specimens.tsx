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

/** A grey faceplate: channel keys, an LCD and the rotary selector. */
function SurfaceSpecimen({ ground, ink, accent }: Swatch) {
  const detents = [-120, -60, 0, 60, 120];
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text
        x="24"
        y="34"
        fill={ink}
        fontFamily={CONDENSED}
        fontStretch="semi-condensed"
        fontSize="12"
        fontWeight="600"
      >
        Hemant Rajput
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${178 + i * 50} 20)`}>
          <rect
            width="44"
            height="20"
            rx="4"
            fill="#eceae5"
            stroke={ink}
            strokeOpacity="0.14"
          />
          <circle
            cx="9"
            cy="10"
            r="2.4"
            fill={i === 0 ? accent : ink}
            fillOpacity={i === 0 ? 1 : 0.25}
          />
          <rect
            x="15"
            y="8.5"
            width="22"
            height="3"
            rx="1"
            fill={ink}
            opacity="0.55"
          />
        </g>
      ))}
      <line
        x1="16"
        x2="384"
        y1="52.5"
        y2="52.5"
        stroke={ink}
        strokeOpacity="0.14"
      />
      <g fill={ink}>
        <rect x="24" y="80" width="150" height="15" rx="2" />
        <rect x="24" y="102" width="118" height="15" rx="2" />
        <rect x="24" y="124" width="136" height="15" rx="2" />
      </g>
      <rect x="24" y="178" width="180" height="70" rx="6" fill="#aab397" />
      <g fill="#1c2217" transform="translate(40 192) skewX(-6)">
        {[0, 28, 70, 98].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <rect x="3" y="0" width="16" height="3.5" rx="1" />
            <rect x="0" y="3" width="3.5" height="15" rx="1" />
            <rect x="19" y="3" width="3.5" height="15" rx="1" />
            <rect x="0" y="21" width="3.5" height="15" rx="1" />
            <rect x="19" y="21" width="3.5" height="15" rx="1" />
            <rect x="3" y="35" width="16" height="3.5" rx="1" />
          </g>
        ))}
      </g>
      <g transform="translate(292 160)">
        <path
          d="M-77.9 45 A90 90 0 1 1 77.9 45"
          fill="none"
          stroke={ink}
          strokeOpacity="0.5"
        />
        {detents.map((a) => (
          <line
            key={a}
            x1="0"
            y1="-82"
            x2="0"
            y2="-96"
            stroke={ink}
            strokeWidth="2"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="78" fill="#c3bfb6" />
        <circle cx="6" cy="12" r="70" fill="#000" opacity="0.18" />
        <circle r="70" fill="#dedcd8" stroke={ink} strokeOpacity="0.25" />
        <circle
          r="70"
          fill="none"
          stroke={ink}
          strokeOpacity="0.28"
          strokeWidth="5"
          strokeDasharray="1 2"
        />
        <circle r="58" fill="#d6d3cd" />
        <line
          x1="0"
          y1="-24"
          x2="0"
          y2="-52"
          stroke={accent}
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-60)"
        />
      </g>
    </svg>
  );
}

/** A sign band, the network map with "you are here", and a flap row. */
function TimetableSpecimen({ ground, ink, accent }: Swatch) {
  const lines = [
    { d: "M44 104H176L196 84H356", c: "#d52b1e" },
    { d: "M44 124H300", c: "#0a5eb0" },
    { d: "M92 144H236", c: "#00874e" },
    { d: "M30 164H200L220 184H320", c: "#b85a00" },
  ];
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <rect width="400" height="38" fill={ink} />
      <rect x="18" y="9" width="20" height="20" rx="3" fill={accent} />
      <text
        x="28"
        y="23"
        fill={ink}
        fontFamily={MONO}
        fontSize="8"
        fontWeight="700"
        textAnchor="middle"
      >
        HR
      </text>
      {["1", "2", "3", "4"].map((n, i) => (
        <g key={n}>
          <rect
            x={196 + i * 46}
            y="12"
            width="13"
            height="13"
            rx="2"
            fill={i === 0 ? accent : "none"}
            stroke={i === 0 ? accent : ground}
            strokeOpacity={i === 0 ? 1 : 0.7}
          />
          <text
            x={202.5 + i * 46}
            y="21.5"
            fill={i === 0 ? ink : ground}
            fontFamily={MONO}
            fontSize="7.5"
            fontWeight="700"
            textAnchor="middle"
          >
            {n}
          </text>
          <rect
            x={213 + i * 46}
            y="17"
            width="20"
            height="3"
            rx="1.5"
            fill={ground}
            opacity="0.55"
          />
        </g>
      ))}
      <rect x="30" y="58" width="150" height="9" rx="2" fill={ink} />
      <line x1="30" x2="370" y1="76" y2="76" stroke={ink} strokeWidth="2" />
      {lines.map((line) => (
        <path
          key={line.d}
          d={line.d}
          fill="none"
          stroke={line.c}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      ))}
      <rect
        x="170"
        y="96"
        width="12"
        height="36"
        rx="6"
        fill={ground}
        stroke={ink}
        strokeWidth="2"
      />
      <circle
        cx="200"
        cy="164"
        r="6"
        fill={ground}
        stroke={ink}
        strokeWidth="2"
      />
      <circle
        cx="356"
        cy="84"
        r="8"
        fill={accent}
        stroke={ink}
        strokeWidth="2"
      />
      <circle cx="356" cy="84" r="2.6" fill={ink} />
      <rect x="30" y="208" width="340" height="50" rx="5" fill={ink} />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <rect
            x={44 + i * 18}
            y="220"
            width="15"
            height="24"
            rx="2"
            fill="#262c32"
          />
          <line
            x1={44 + i * 18}
            x2={59 + i * 18}
            y1="232"
            y2="232"
            stroke="#0a0c0e"
          />
        </g>
      ))}
      {"ZUNTA".split("").map((ch, i) => (
        <text
          key={i}
          x={51.5 + i * 18}
          y="237"
          fill="#f4f6f7"
          fontFamily={MONO}
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          {ch}
        </text>
      ))}
      {"NOW".split("").map((ch, i) => (
        <text
          key={i}
          x={177.5 + i * 18}
          y="237"
          fill={accent}
          fontFamily={MONO}
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          {ch}
        </text>
      ))}
      <text
        x="356"
        y="237"
        fill="#aab3bb"
        fontFamily={MONO}
        fontSize="8"
        fontWeight="600"
        textAnchor="end"
      >
        ON TIME
      </text>
    </svg>
  );
}

/** A survey sheet: title band, contoured massif, grid, the sea past today and the loupe. */
function SurveySpecimen({ ground, ink, accent }: Swatch) {
  const water = "#255f8a";
  const hills = [
    { cx: 238, cy: 128, rx: 92, ry: 44, n: 5 },
    { cx: 300, cy: 150, rx: 44, ry: 24, n: 3 },
  ];
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text
        x="24"
        y="40"
        fill={ink}
        fontFamily={SERIF}
        fontSize="17"
        letterSpacing="6"
      >
        RAJPUT-HEMANT
      </text>
      <line x1="24" x2="376" y1="52" y2="52" stroke={ink} strokeWidth="1.5" />
      <rect x="24" y="64" width="352" height="176" fill="#ebefe7" />
      <g stroke={water} strokeOpacity="0.3">
        {[94, 164, 234, 304].map((x) => (
          <line key={x} x1={x} x2={x} y1="64" y2="240" />
        ))}
        {[108, 152, 196].map((y) => (
          <line key={y} x1="24" x2="336" y1={y} y2={y} />
        ))}
      </g>
      <line
        x1="24"
        x2="336"
        y1="160"
        y2="160"
        stroke={ink}
        strokeOpacity="0.5"
        strokeDasharray="6 2 1 2"
      />
      {hills.map((h) =>
        Array.from({ length: h.n }, (_, i) => (
          <ellipse
            key={`${h.cx}-${i}`}
            cx={h.cx}
            cy={h.cy - i * 5}
            rx={h.rx * (1 - i / (h.n + 0.6))}
            ry={h.ry * (1 - i / (h.n + 0.6))}
            fill={i === h.n - 1 ? "#d7c19a" : "none"}
            stroke={accent}
            strokeWidth={i === 2 ? 1.6 : 0.8}
          />
        ))
      )}
      <rect x="336" y="64" width="40" height="176" fill="#d2e1e5" />
      <g stroke={water} strokeWidth="0.6">
        {[339, 343, 348, 354, 361, 369].map((x) => (
          <line key={x} x1={x} x2={x} y1="64" y2="240" />
        ))}
      </g>
      <rect
        x="24"
        y="64"
        width="352"
        height="176"
        fill="none"
        stroke={ink}
        strokeWidth="0.9"
      />
      <path d="M90 204L97 216H83Z" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="90" cy="211.5" r="1.4" fill={ink} />
      <path d="M150 196H158M154 192V200" stroke={ink} strokeWidth="1.2" />
      <g transform="translate(206 176)">
        <ellipse rx="40" ry="36" fill="none" stroke={ink} />
        <path
          d="M0 -36V-30M0 30V36M-40 0H-34M34 0H40M-4 0H4M0 -4V4"
          stroke={ink}
        />
      </g>
      <circle cx="238" cy="104" r="2" fill="#7a4aa5" />
      <text
        x="24"
        y="262"
        fill={water}
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="1"
      >
        2022 2023 2024 2025 2026
      </text>
    </svg>
  );
}

/** A press proof: crop marks, a control strip, the headline on two plates out of register. */
function PressSpecimen({ ground, ink, accent }: Swatch) {
  const crop = "M0 10H7M10 0V7";
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <g fill="none" stroke={ink} strokeOpacity="0.7">
        <path d={crop} transform="translate(12 12)" />
        <path d={crop} transform="translate(388 12) scale(-1 1)" />
        <path d={crop} transform="translate(12 268) scale(1 -1)" />
        <path d={crop} transform="translate(388 268) scale(-1 -1)" />
      </g>
      <g>
        {Array.from({ length: 14 }, (_, i) => (
          <rect
            key={i}
            x={34 + i * 9}
            y="18"
            width="9"
            height="9"
            fill={i < 4 ? "#321871" : ink}
            opacity={i < 4 ? 1 : 0.22}
          />
        ))}
      </g>
      <g style={{ mixBlendMode: "multiply" }}>
        <circle
          cx="200"
          cy="22"
          r="5"
          fill="none"
          stroke={accent}
          transform="translate(1.4 1)"
        />
        <circle cx="200" cy="22" r="5" fill="none" stroke={ink} />
      </g>
      <g
        fontFamily={CONDENSED}
        fontWeight="900"
        fontSize="88"
        letterSpacing="-5"
      >
        <text x="30" y="150" fill={accent} style={{ mixBlendMode: "multiply" }}>
          Proof
        </text>
        <text x="35" y="146" fill={ink} style={{ mixBlendMode: "multiply" }}>
          Proof
        </text>
      </g>
      <rect x="32" y="172" width="120" height="6" fill="#ffe800" />
      <g fill={ink} opacity="0.4">
        <rect x="32" y="192" width="170" height="3" />
        <rect x="32" y="201" width="136" height="3" />
      </g>
      <g transform="translate(262 60)">
        <rect width="104" height="30" rx="4" fill={accent} opacity="0.85" />
        <rect y="36" width="104" height="30" rx="4" fill={ink} opacity="0.85" />
        <path
          d="M8 66L30 118H104V66"
          fill={ground}
          stroke={ink}
          strokeWidth="1.2"
        />
      </g>
      <g
        transform="translate(262 206) rotate(-4)"
        fill="none"
        stroke={ink}
        strokeWidth="1.5"
      >
        <rect width="104" height="42" />
        <path d="M8 16h8v8h-8zM9 17l6 6M15 17l-6 6" />
      </g>
      <g fill={ink} opacity="0.5">
        <rect x="290" y="222" width="60" height="3" />
        <rect x="290" y="232" width="44" height="3" />
      </g>
    </svg>
  );
}

export const liveSpecimens: Record<
  LiveFlavorId,
  (swatch: Swatch) => React.ReactNode
> = {
  minimal: MinimalSpecimen,
  "drawing-set": DrawingSetSpecimen,
  surface: SurfaceSpecimen,
  timetable: TimetableSpecimen,
  survey: SurveySpecimen,
  press: PressSpecimen,
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
