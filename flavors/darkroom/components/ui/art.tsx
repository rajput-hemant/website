import {
  FRAME_H,
  FRAME_W,
  frameArt,
  type Archetype,
} from "@/flavors/darkroom/lib/frame-art";
import { cn } from "@/flavors/darkroom/lib/utils";

/** One frame's picture in three densities. Decorative: the frame's link names it. */
export function Art({
  archetype,
  seed,
  className,
}: {
  archetype: Archetype;
  seed: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      className={cn("art block size-full", className)}
    >
      {frameArt(archetype, seed).map((shape, i) =>
        shape.kind === "rect" ? (
          <rect
            key={i}
            className={shape.tone}
            x={shape.x}
            y={shape.y}
            width={shape.w}
            height={shape.h}
          />
        ) : shape.kind === "circle" ? (
          <circle
            key={i}
            className={shape.tone}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
          />
        ) : (
          <polygon
            key={i}
            className={shape.tone}
            points={shape.points.join(" ")}
          />
        )
      )}
    </svg>
  );
}
