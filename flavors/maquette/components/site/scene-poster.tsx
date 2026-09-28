"use client";

import * as React from "react";
import { parseBoard } from "@/flavors/maquette/lib/model";
import { drawModel } from "@/flavors/maquette/lib/scene/axo";
import { stackLabels } from "@/flavors/maquette/lib/scene/labels";
import { poses, type SceneRoute } from "@/flavors/maquette/lib/scene/poses";
import { lightAt } from "@/flavors/maquette/lib/sun";
import { useSunMinutes } from "@/flavors/maquette/lib/sun-store";

import { useRootData } from "@/components/semantic/use-root-data";

/** A piece that carries a numbered pin over the model, with its name. */
export type Pin = { id: string; n: number; name: string };

const FILL = {
  card: "m-card",
  grey: "m-grey",
  foam: "m-foam",
  wood: "m-wood",
} as const;

/**
 * The model drawn in parallel projection from the camera's angle, lit by
 * the shadow study's sun (or the lamp at night), so its shadows follow the
 * slider as the scene's do. It is the poster until the canvas is ready, and
 * the whole scene without WebGL, with the scene off, or on low power.
 */
export function ScenePoster({
  route,
  board,
  pins = [],
}: {
  route: SceneRoute;
  board: string | null;
  /** Pieces that carry a pin, with their catalogue numbers and names. */
  pins?: readonly Pin[];
}) {
  const minutes = useSunMinutes();
  const night = useRootData("theme", "light") === "dark";
  const plan = parseBoard(board);
  const drawing = drawModel(plan, poses[route], lightAt(minutes, night));
  const clip = `poster-site-${React.useId().replace(/:/g, "")}`;
  const pinned = new Map(pins.map((pin) => [pin.id, pin]));
  // Pins with their names, raised where two labels would overlap. The
  // name's width is estimated from its length: Jost at 12px.
  const shown = drawing.blocks.flatMap((block) => {
    const pin = pinned.get(block.id);
    return pin ? [{ block, pin }] : [];
  });
  // A name that would run off the right edge is set to the pin's left.
  const boxes = shown.map(({ block, pin }) => {
    const w = 30 + pin.name.length * 6.4;
    const flip = block.pin.x - 11 + w > drawing.width - 4;
    return {
      flip,
      x: flip ? block.pin.x + 11 - w : block.pin.x - 11,
      y: block.pin.y - 41,
      w,
      h: 22,
    };
  });
  const rises = stackLabels(boxes);
  const labels = shown.map((label, i) => ({
    ...label,
    flip: boxes[i]?.flip ?? false,
    rise: rises[i] ?? 0,
  }));
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
      {/* Shadows fall on the site card; a low sun's run off its edge is cut there. */}
      <clipPath id={clip}>
        <polygon points={drawing.card} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {drawing.shadows.map((points, i) => (
          <polygon key={i} className="m-shade" points={points} />
        ))}
      </g>
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
      {labels.map(({ block, pin, flip, rise }) => {
        const on = plan.focus === block.id;
        return (
          <g
            key={block.id}
            transform={`translate(${block.pin.x.toFixed(1)} ${(block.pin.y - 30 - rise).toFixed(1)})`}
          >
            <line className="m-line" y1={11} y2={30 + rise} />
            <circle className={on ? "m-wood-fill" : "m-card"} r={11} />
            <text
              textAnchor="middle"
              dy="3.5"
              className="fill-[#202326] font-mono text-[10px]"
            >
              {String(pin.n).padStart(2, "0")}
            </text>
            <text
              x={flip ? -15 : 15}
              dy="4"
              textAnchor={flip ? "end" : "start"}
              className={on ? "m-pin-name m-pin-on" : "m-pin-name"}
            >
              {pin.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
