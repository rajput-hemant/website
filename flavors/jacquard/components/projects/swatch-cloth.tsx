import { cn } from "@/flavors/jacquard/lib/utils";
import {
  twill,
  yarnClass,
  type Draft,
  type Pick,
} from "@/flavors/jacquard/lib/weave";

/** Every cell of one end in a swatch, as one path in cell units. */
function endPath(cells: number[][], end: number) {
  let d = "";
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell === end) d += `M${x + 0.12} ${y - 0.06}h.76v1.12h-.76z`;
    })
  );
  return d;
}

/**
 * A project's swatch: its own pick stepped one end per row, so a full stack
 * reads as a broad band and a small tool as a few fine lines. Each end is
 * its own path, in its kind's yarn, so pointing at a material can dim the
 * rest. The selvedge carries the label, the way a sample book's cloth does.
 */
export function SwatchCloth({
  draft,
  pick,
  selvedge,
  id,
  className,
}: {
  /** Unique on the page, for the weft pattern. */
  id: string;
  draft: Draft;
  pick: Pick | undefined;
  selvedge: string;
  className?: string;
}) {
  const cells = twill(draft, pick);
  const n = cells.length;
  return (
    <div
      className={cn(
        "swatch relative aspect-square bg-cloth shadow-cloth",
        "after:absolute after:top-full after:right-0 after:left-[18px] after:h-2.5 after:bg-[repeating-linear-gradient(90deg,var(--color-cloth)_0_1.5px,transparent_1.5px_4px)] after:[mask:linear-gradient(#000,transparent)]",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${n} ${n}`}
        aria-hidden
        focusable="false"
        preserveAspectRatio="none"
        className="block size-full pl-[18px]"
      >
        <defs>
          <pattern
            id={`weft-${id}`}
            width="1"
            height="1"
            patternUnits="userSpaceOnUse"
          >
            <rect width="1" height="1" fill="#2a2d33" />
            <rect y=".18" width="1" height=".64" fill="#30333a" />
          </pattern>
        </defs>
        <rect width={n} height={n} fill={`url(#weft-${id})`} />
        {pick?.ends.map((e) => {
          const end = draft.ends[e];
          return end ? (
            <path
              key={e}
              data-e={e}
              className={cn("end", yarnClass[end.kind])}
              d={endPath(cells, e)}
            />
          ) : null;
        })}
      </svg>
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-[18px] rotate-180 overflow-hidden bg-selvedge text-center font-mono text-[0.53rem] leading-[18px] tracking-[0.26em] whitespace-nowrap text-selvedge-ink uppercase [writing-mode:vertical-rl]"
      >
        {selvedge}
      </span>
    </div>
  );
}
