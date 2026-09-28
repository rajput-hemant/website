import { cn } from "@/flavors/calibre/lib/utils";

/**
 * A plain subdial for a page without the movement: a guilloché of fine
 * rings on raised dial stock, one true figure in Bodoni and its unit in
 * small caps. Decorative; the figure is also in the page's text.
 */
export function Face({
  figure,
  unit,
  className,
}: {
  figure: string | number;
  unit: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      focusable="false"
      className={cn("block h-full w-full bg-raise", className)}
    >
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={100 + Math.cos(i * 0.9) * 6}
          cy={100 + Math.sin(i * 0.9) * 6}
          r={30 + i * 3.4}
          fill="none"
          className="stroke-line-strong"
          strokeWidth="0.35"
        />
      ))}
      <text
        x="100"
        y="96"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="54"
        className="fill-ink numeral"
      >
        {figure}
      </text>
      <text
        x="100"
        y="132"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="2.4"
        className="fill-faint font-spec"
      >
        {unit.toLowerCase()}
      </text>
    </svg>
  );
}
