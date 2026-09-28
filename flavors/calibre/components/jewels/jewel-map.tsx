import { pad2, ring } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

/**
 * Where a jewel sits among all of them: one chaton per project round a
 * ring, this project's set in ruby, its number in the middle. Decorative;
 * the card says "Jewel 03 of 9" in text.
 */
export function JewelMap({
  n,
  of,
  className,
}: {
  n: number;
  of: number;
  className?: string;
}) {
  const seats = ring(of, 30, 40, 40);
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden
      focusable="false"
      className={cn("jewel-map block size-20 shrink-0", className)}
    >
      {seats.map((p, i) =>
        i + 1 === n ? (
          <circle key={i} className="stone" cx={p.x} cy={p.y} r={4.6} />
        ) : (
          <circle key={i} className="chaton" cx={p.x} cy={p.y} r={3.2} />
        )
      )}
      <text
        x="40"
        y="41"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="19"
        className="fill-ink numeral-italic"
      >
        {pad2(n)}
      </text>
    </svg>
  );
}
