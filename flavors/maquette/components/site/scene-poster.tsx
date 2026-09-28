import { parseBoard } from "@/flavors/maquette/lib/model";
import { drawModel } from "@/flavors/maquette/lib/scene/axo";
import { poses, type SceneRoute } from "@/flavors/maquette/lib/scene/poses";
import { DEFAULT_MINUTES, lightAt } from "@/flavors/maquette/lib/sun";

/** A piece that carries a numbered pin over the model. */
export type Pin = { id: string; n: number };

const FILL = {
  card: "m-card",
  grey: "m-grey",
  foam: "m-foam",
  wood: "m-wood",
} as const;

/**
 * The model drawn in parallel projection from the camera's angle, lit by
 * the study's resting sun. It is the poster until the canvas is ready, and
 * the whole scene without WebGL, with the scene off, or on low power.
 */
export function ScenePoster({
  route,
  board,
  pins = [],
}: {
  route: SceneRoute;
  board: string | null;
  /** Pieces that carry a numbered pin, with their catalogue numbers. */
  pins?: readonly Pin[];
}) {
  const drawing = drawModel(
    parseBoard(board),
    poses[route],
    lightAt(DEFAULT_MINUTES, false)
  );
  const pinned = new Map(pins.map((pin) => [pin.id, pin.n]));
  return (
    <svg
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      aria-hidden
      focusable="false"
      className="block h-full w-full"
    >
      {drawing.plinth.map((face) => (
        <g key={face.points}>
          <polygon className="fill-plinth" points={face.points} />
          <polygon points={face.points} opacity={face.shade} />
        </g>
      ))}
      <polygon className="m-site" points={drawing.card} />
      {drawing.shadows.map((points, i) => (
        <polygon key={i} className="m-shade" points={points} />
      ))}
      {drawing.blocks.map((block) => (
        <g key={block.id}>
          {block.faces.map((face) => (
            <g key={face.points}>
              <polygon
                className={FILL[block.material]}
                strokeWidth={0.6}
                points={face.points}
              />
              <polygon points={face.points} opacity={face.shade} />
            </g>
          ))}
          <path
            className={block.material === "wood" ? "m-wood" : "m-line"}
            strokeWidth={block.material === "wood" ? 1.6 : 0.6}
            d={block.lines.join("")}
          />
        </g>
      ))}
      {drawing.blocks.map((block) => {
        const n = pinned.get(block.id);
        if (!n) return null;
        return (
          <g
            key={block.id}
            transform={`translate(${block.pin.x.toFixed(1)} ${(block.pin.y - 30).toFixed(1)})`}
          >
            <line className="m-line" y1={11} y2={30} />
            <circle className="m-card" r={11} />
            <text
              textAnchor="middle"
              dy="3.5"
              className="fill-ink font-mono text-[10px]"
            >
              {String(n).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
