import type { FlavorMeta, LiveFlavorId } from "@/flavors/registry";

import type { SiteIdentity } from "@/lib/data/identity";

type Swatch = FlavorMeta["swatch"];

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const CONDENSED =
  "'Archivo Narrow', 'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

/** Everything after the first name, for specimens that set the name on two lines. */
function restOfName(who: SiteIdentity): string {
  return who.name.slice(who.firstName.length).trim();
}

const svgProps = {
  "aria-hidden": true,
  focusable: false,
  className: "block h-auto w-full",
} as const;

/** A paper page: serif display, hairline rules and an index of rows. */
function MinimalSpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text x="32" y="40" fill={ink} fontFamily={SERIF} fontSize="15">
        {who.shortName}
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
function DrawingSetSpecimen(
  { ground, ink, accent }: Swatch,
  who: SiteIdentity
) {
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
        {who.name.toLocaleUpperCase()}
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
function SurfaceSpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
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
        {who.name}
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
function TimetableSpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
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
        {who.initials}
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
function SurveySpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
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
        {who.handle.toLocaleUpperCase()}
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

/** A sample book: the name in label caps, and a twill cloth hanging over its draft. */
function JacquardSpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
  const cells = [
    [0, 1, 2, 3, 6],
    [1, 4, 5],
    [0, 2, 7, 8],
    [3, 5, 9],
  ];
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <defs>
        <pattern
          id="jq-specimen-twill"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <rect width="6" height="6" fill="#cdccc4" />
          <path
            fill="#2b2e33"
            d="M0 0h1.5v1.5H0zM1.5 1.5h1.5v1.5H1.5zM3 3h1.5v1.5H3zM4.5 4.5h1.5v1.5H4.5z"
          />
        </pattern>
      </defs>
      <rect width="400" height="280" fill={ground} />
      <text
        x="32"
        y="40"
        fill={ink}
        fontFamily={SERIF}
        fontSize="11"
        letterSpacing="2.4"
      >
        {who.name.toLocaleUpperCase()}
      </text>
      <line
        x1="32"
        x2="368"
        y1="58"
        y2="58"
        stroke={ink}
        strokeOpacity="0.14"
      />
      <text x="31" y="118" fill={ink} fontFamily={SERIF} fontSize="44">
        {who.firstName}
      </text>
      <text x="31" y="162" fill={ink} fontFamily={SERIF} fontSize="44">
        {restOfName(who)}
      </text>
      <g stroke={ink} strokeOpacity="0.2">
        <line x1="32" x2="170" y1="208" y2="208" />
        <line x1="32" x2="170" y1="222" y2="222" />
        <line x1="32" x2="170" y1="236" y2="236" />
      </g>
      <line
        x1="238"
        x2="338"
        y1="72"
        y2="72"
        stroke="#2a2d32"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M250 73H326V166Q316 172 307 167Q297 173 288 167Q278 173 269 167Q259 173 250 167Z"
        fill="url(#jq-specimen-twill)"
      />
      <rect x="298" y="154" width="20" height="6" fill={accent} />
      <g fill="none" stroke={ink} strokeOpacity="0.16">
        <rect x="240" y="186" width="96" height="48" />
      </g>
      <g fill={ink}>
        {cells.flatMap((row, y) =>
          row.map((x) => (
            <rect
              key={`${x}-${y}`}
              x={242 + x * 9.4}
              y={189 + y * 11.4}
              width="7"
              height="8"
            />
          ))
        )}
      </g>
      <rect x="242" y="200.4" width="7" height="8" fill={accent} />
    </svg>
  );
}

function DarkroomSpecimen({ ground, ink, accent }: Swatch) {
  const selects = new Set([0, 3, 5, 10]);
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text
        x="24"
        y="58"
        fill={ink}
        fontFamily={CONDENSED}
        fontWeight="800"
        fontSize="44"
        letterSpacing="-1"
      >
        Contact sheet
      </text>
      <rect
        x="20"
        y="84"
        width="360"
        height="172"
        rx="2"
        fill={ink}
        opacity="0.06"
      />
      {[0, 1].map((row) => (
        <g key={row} transform={`translate(32 ${100 + row * 76})`}>
          <rect width="336" height="60" fill="#070303" />
          {Array.from({ length: 7 }, (_, i) => {
            const n = row * 7 + i;
            return (
              <g key={i} transform={`translate(${4 + i * 47.4} 12)`}>
                <rect
                  width="43"
                  height="36"
                  fill={ink}
                  opacity={0.18 + (n % 3) * 0.12}
                />
                {selects.has(n) ? (
                  <ellipse
                    cx="21.5"
                    cy="18"
                    rx="27"
                    ry="24"
                    fill="none"
                    stroke={accent}
                    strokeWidth="2"
                  />
                ) : null}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/** A standards-manual sheet: the red band, the trajectory's transfer arcs and one still climbing. */
function MissionSpecimen({ ground, ink, accent }: Swatch) {
  const arcs: [number, number, number][] = [
    [44, 172, 60],
    [56, 118, 34],
    [84, 222, 72],
    [84, 170, 46],
    [192, 290, 40],
  ];
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <rect width="400" height="8" fill={accent} />
      <text
        x="24"
        y="64"
        fill={ink}
        fontFamily={CONDENSED}
        fontWeight="800"
        fontSize="42"
        letterSpacing="-1.5"
      >
        Flight plan
      </text>
      <text x="24" y="86" fill={accent} fontFamily={MONO} fontSize="9">
        FIG. 2 · T-0 JUN 2024
      </text>
      <line x1="24" y1="98" x2="376" y2="98" stroke={ink} strokeWidth="2" />
      <g fill="none" stroke={ink} strokeWidth="1.2">
        {arcs.map(([a, b, h]) => (
          <path
            key={`${a}-${b}`}
            d={`M${a} 240A${(b - a) / 2} ${h * 1.6} 0 0 1 ${b} 240`}
          />
        ))}
      </g>
      <path
        d="M272 240A64 88 0 0 1 336 152"
        fill="none"
        stroke={accent}
        strokeWidth="2.4"
      />
      <path
        d="M336 152H376"
        stroke={ink}
        strokeWidth="1.4"
        strokeDasharray="1.5 4"
      />
      <circle
        cx="336"
        cy="152"
        r="4"
        fill={ground}
        stroke={accent}
        strokeWidth="2"
      />
      <line x1="24" y1="240" x2="376" y2="240" stroke={ink} strokeWidth="1.4" />
    </svg>
  );
}

/** A study model: the name set light, and card blocks on a basswood plinth casting one afternoon's shadows. */
function MaquetteSpecimen({ ground, ink, accent }: Swatch, who: SiteIdentity) {
  // Blocks in a 30° axonometric: x, y on the site, width, depth, storeys, material.
  const blocks: [number, number, number, number, number, string][] = [
    [0, 0, 4, 2, 4, "#fafaf8"],
    [5, 1, 1, 3, 3, "#b3b6b3"],
    [1, 3, 3, 1, 1, "#d6d7d3"],
    [4, 5, 4, 1, 3, "#fafaf8"],
  ];
  const geometric = "Futura, 'Century Gothic', 'Avenir Next', sans-serif";
  const u = 12;
  const iso = (x: number, y: number, z: number) =>
    [270 + (x - y) * u * 0.87, 150 + (x + y) * u * 0.5 - z * u].join(",");
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <text
        x="28"
        y="42"
        fill={ink}
        fontFamily={geometric}
        fontSize="10"
        letterSpacing="2.2"
      >
        MODEL ROOM, 1:100
      </text>
      <text
        x="26"
        y="104"
        fill={ink}
        fontFamily={geometric}
        fontWeight="300"
        fontSize="44"
      >
        {who.firstName}
      </text>
      <text
        x="26"
        y="148"
        fill={ink}
        fontFamily={geometric}
        fontWeight="300"
        fontSize="44"
      >
        {restOfName(who)}
      </text>
      <polygon
        points={[
          iso(-1, -1, 0),
          iso(10, -1, 0),
          iso(10, 8, 0),
          iso(-1, 8, 0),
        ].join(" ")}
        fill="#f2f2ef"
      />
      <polygon
        points={[
          iso(-1, 8, 0),
          iso(10, 8, 0),
          iso(10, 8, -1),
          iso(-1, 8, -1),
        ].join(" ")}
        fill="#c6a477"
      />
      <polygon
        points={[
          iso(10, -1, 0),
          iso(10, 8, 0),
          iso(10, 8, -1),
          iso(10, -1, -1),
        ].join(" ")}
        fill="#a98a5e"
      />
      {blocks.map(([x, y, w, d, n, fill]) => (
        <g
          key={`${x}-${y}`}
          stroke={ink}
          strokeOpacity="0.18"
          strokeWidth="0.6"
        >
          <polygon
            points={[
              iso(x, y + d, 0),
              iso(x + w, y + d, 0),
              iso(x + w + n * 0.9, y + d + n * 0.4, 0),
              iso(x + n * 0.9, y + d + n * 0.4, 0),
            ].join(" ")}
            fill={ink}
            fillOpacity="0.12"
            stroke="none"
          />
          <polygon
            points={[
              iso(x, y + d, 0),
              iso(x + w, y + d, 0),
              iso(x + w, y + d, n),
              iso(x, y + d, n),
            ].join(" ")}
            fill={fill}
          />
          <polygon
            points={[
              iso(x + w, y, 0),
              iso(x + w, y + d, 0),
              iso(x + w, y + d, n),
              iso(x + w, y, n),
            ].join(" ")}
            fill={fill}
            fillOpacity="0.8"
          />
          <polygon
            points={[
              iso(x, y, n),
              iso(x + w, y, n),
              iso(x + w, y + d, n),
              iso(x, y + d, n),
            ].join(" ")}
            fill={fill}
          />
        </g>
      ))}
      <rect x="28" y="232" width="150" height="1" fill={ink} opacity="0.3" />
      <circle cx="120" cy="232" r="4" fill={accent} />
    </svg>
  );
}

function CalibreSpecimen({ ground, ink, accent }: Swatch) {
  const at = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [200 + Math.cos(a) * r, 140 + Math.sin(a) * r] as const;
  };
  return (
    <svg viewBox="0 0 400 280" {...svgProps}>
      <rect width="400" height="280" fill={ground} />
      <circle cx="200" cy="140" r="118" fill="#d9dde1" />
      <circle cx="200" cy="140" r="94" fill="#26292d" />
      <circle cx="200" cy="140" r="86" fill="#d4d8dc" />
      {Array.from({ length: 60 }, (_, i) => {
        const [x1, y1] = at(i * 6, 114);
        const [x2, y2] = at(i * 6, i % 5 === 0 ? 102 : 108);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ink}
            strokeWidth={i % 15 === 0 ? 3 : i % 5 === 0 ? 2 : 0.8}
          />
        );
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const [x, y] = at((i / 14) * 360, 64);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4.5"
            fill="#a3203f"
            stroke="#d2a07f"
            strokeWidth="2"
          />
        );
      })}
      <circle
        cx="200"
        cy="140"
        r="30"
        fill="none"
        stroke="#d2a07f"
        strokeWidth="3"
      />
      <path
        d="M200 50L194 74H198V112H202V74H206Z"
        fill={accent}
        transform="rotate(90 200 140)"
      />
    </svg>
  );
}

export const liveSpecimens: Record<
  LiveFlavorId,
  (swatch: Swatch, who: SiteIdentity) => React.ReactNode
> = {
  minimal: MinimalSpecimen,
  "drawing-set": DrawingSetSpecimen,
  surface: SurfaceSpecimen,
  timetable: TimetableSpecimen,
  survey: SurveySpecimen,
  press: PressSpecimen,
  jacquard: JacquardSpecimen,
  darkroom: DarkroomSpecimen,
  mission: MissionSpecimen,
  maquette: MaquetteSpecimen,
  calibre: CalibreSpecimen,
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
