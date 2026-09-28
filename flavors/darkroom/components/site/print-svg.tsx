import type { PrintShape } from "@/flavors/darkroom/lib/scene/prints";

const fill: Record<PrintShape["tone"], string> = {
  hi: "fill-img-hi",
  mid: "fill-img-mid",
  lo: "fill-img-lo",
  black: "fill-strip",
  grease: "fill-none stroke-grease",
};

/** A print's shapes in SVG, for the poster: the same list the scene paints. */
export function PrintSvg({ shapes }: { shapes: readonly PrintShape[] }) {
  return shapes.map((shape, i) => {
    switch (shape.kind) {
      case "rect":
        return (
          <rect
            key={i}
            className={fill[shape.tone]}
            x={shape.x}
            y={shape.y}
            width={shape.w}
            height={shape.h}
            opacity={shape.alpha}
          />
        );
      case "circle":
        return (
          <circle
            key={i}
            className={fill[shape.tone]}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
          />
        );
      case "poly":
        return (
          <polygon
            key={i}
            className={fill[shape.tone]}
            points={shape.points.join(" ")}
          />
        );
      case "ring":
        return (
          <ellipse
            key={i}
            className={fill.grease}
            strokeWidth={5}
            cx={shape.cx}
            cy={shape.cy}
            rx={shape.rx}
            ry={shape.ry}
          />
        );
    }
  });
}
