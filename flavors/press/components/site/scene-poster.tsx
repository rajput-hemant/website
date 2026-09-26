import { poses, type SceneRoute } from "@/flavors/press/lib/scene/poses";

/**
 * The press drawn flat: a printed sheet leaving the pink and blue drums, its
 * corner peeled, the next sheet waiting behind. It is the poster before the
 * canvas is ready and the whole scene without WebGL, with motion reduced, or
 * on low power. The sheet's plates register with the rest of the page.
 */
export function ScenePoster({ route }: { route: SceneRoute }) {
  const pose = poses[route];
  const glyph = pose.glyph;
  const size = glyph.length > 2 ? 78 : 104;
  const far = pose.spoiled ? "[--mis-k:3.5]" : "";
  return (
    <svg
      viewBox="0 0 560 460"
      aria-hidden
      focusable="false"
      className={`block h-full w-full overflow-visible ${far}`}
    >
      <defs>
        <clipPath id={`press-sheet-${route}`}>
          <path d="M0 0H260V150L190 230H0Z" />
        </clipPath>
      </defs>
      <g className="fill-shade stroke-ink [stroke-width:1.2] [stroke-linejoin:round]">
        <path d="M102 150L342 150L372 40L132 40Z" />
      </g>
      <path
        d="M140 64H352M146 76H300"
        className="fill-none stroke-ink-soft"
        strokeDasharray="2 4"
      />
      <g className="stroke-ink [stroke-width:1.2]">
        <path
          className="fill-[color-mix(in_srgb,var(--color-blue)_70%,var(--color-paper))] blend"
          d="M30 190H420A11 34 0 0 1 420 258H30A11 34 0 0 1 30 190Z"
        />
        <ellipse className="fill-shade" cx="420" cy="224" rx="11" ry="34" />
        <path
          className="fill-[color-mix(in_srgb,var(--color-pink)_78%,var(--color-paper))] blend"
          d="M30 116H420A11 34 0 0 1 420 184H30A11 34 0 0 1 30 116Z"
        />
        <ellipse className="fill-shade" cx="420" cy="150" rx="11" ry="34" />
      </g>
      <g className="stroke-sheet [stroke-width:3] opacity-55 [stroke-linecap:round]">
        <line x1="36" y1="202" x2="416" y2="202" />
        <line x1="36" y1="128" x2="416" y2="128" />
      </g>
      <g transform="translate(86 186) skewX(14)">
        <path
          className="fill-sheet stroke-ink [stroke-width:1.2] [stroke-linejoin:round]"
          d="M0 0H260V150L190 230H0Z"
        />
        <g clipPath={`url(#press-sheet-${route})`}>
          <rect
            className="fill-yellow blend"
            x="16"
            y="118"
            width="128"
            height="84"
          />
          <text
            className="press-glyph p1 fill-pink font-sans font-black blend"
            x="10"
            y="104"
            fontSize={size}
            letterSpacing="-5"
          >
            {glyph}
          </text>
          <text
            className="press-glyph p2 fill-blue font-sans font-black blend"
            x="10"
            y="104"
            fontSize={size}
            letterSpacing="-5"
          >
            {glyph}
          </text>
          <path
            className="fill-none stroke-blue [stroke-width:4] blend"
            d="M158 126H238M158 138H238M158 150H230M158 174H214M158 186H204"
          />
        </g>
        <path
          className="fill-ink opacity-15"
          transform="translate(-6 6)"
          d="M260 150Q221 141 181 161Q175 197 190 230Z"
        />
        <path
          className="fill-shade stroke-ink [stroke-width:1.2] [stroke-linejoin:round]"
          d="M260 150Q221 141 181 161Q175 197 190 230Z"
        />
      </g>
      <g className="fill-ink-soft slug [font-size:11px]">
        <text x="444" y="146">
          <tspan className="fill-ink font-semibold">P1 drum</tspan>
          <tspan x="444" dy="14">
            interface
          </tspan>
        </text>
        <text x="444" y="220">
          <tspan className="fill-ink font-semibold">P2 drum</tspan>
          <tspan x="444" dy="14">
            systems
          </tspan>
        </text>
        <text x="444" y="296">
          <tspan className="fill-ink font-semibold">
            {pose.slug.split("  /  ")[0]}
          </tspan>
          <tspan x="444" dy="14">
            {pose.slug.split("  /  ")[1]}
          </tspan>
        </text>
      </g>
      <circle className="fill-ink" cx="318" cy="300" r="2.2" />
      <path className="fill-none stroke-ink-soft" d="M318 300H438" />
    </svg>
  );
}
