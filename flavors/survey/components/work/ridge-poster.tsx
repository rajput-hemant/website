import type { blockPoster } from "@/flavors/survey/lib/ridge-block";
import { cn } from "@/flavors/survey/lib/utils";

export type BlockPosterPaths = ReturnType<typeof blockPoster>;

/** The poster box: the glyph's canvas is drawn at the same aspect. */
export const POSTER_BOX = { w: 160, h: 88 } as const;

/**
 * A block diagram at rest, flat: far skirts, the ground in a mid tint with
 * its crest, near skirts over it. The poster, and the T0 state, of a block
 * glyph.
 */
export function RidgePoster({
  paths,
  className,
  w = POSTER_BOX.w,
  h = POSTER_BOX.h,
}: {
  paths: BlockPosterPaths;
  className?: string;
  w?: number;
  h?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      className={cn("block", className)}
      strokeLinejoin="round"
    >
      {paths.far.map((d) => (
        <path
          key={d}
          d={d}
          className="fill-sheet stroke-ink"
          strokeWidth="0.8"
        />
      ))}
      <path
        d={paths.top}
        className="fill-tint-3 stroke-ink"
        strokeWidth="0.8"
      />
      <path
        d={paths.crest}
        className="fill-none stroke-contour"
        strokeWidth="1"
      />
      {paths.near.map((d) => (
        <path
          key={d}
          d={d}
          className="fill-sheet stroke-ink"
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}
