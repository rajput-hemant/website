import * as React from "react";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/maquette/components/site/scene-slot";
import { cn } from "@/flavors/maquette/lib/utils";

import { Container } from "./container";

export type Meta = { label: string; value: React.ReactNode };

/**
 * The head of every inner page: its room number and what it is in the model
 * room, the title, a lede and the key facts. The model stands on the right
 * with this page's pieces on the plinth.
 */
export function PageHeader({
  frame,
  kicker,
  title,
  lede,
  meta,
  scene,
  board,
  sceneLabel,
  children,
}: {
  /** The page's room number (`01`), or null for a page off the plan. */
  frame: string | null;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: Meta[];
  scene: SceneRoute | null;
  board?: string | null;
  sceneLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <Container
      className={cn(
        "grid gap-x-10 gap-y-10 pt-[clamp(2rem,1rem+3vw,3.5rem)]",
        scene && "lg:grid-cols-12 lg:items-end"
      )}
    >
      <div className={cn("min-w-0", scene && "lg:col-span-6")}>
        <p className="caps">
          {frame ? <>Room {frame} · </> : null}
          {kicker}
        </p>
        <h1 className="mt-5 -ml-[0.04em] text-display tracking-[-0.035em] [overflow-wrap:anywhere]">
          {title}
        </h1>
        {lede ? (
          <div className="mt-6 max-w-[34ch] font-display text-lead tracking-[-0.005em]">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-4 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="caps">{item.label}</dt>
                <dd className="mt-1 text-sm leading-snug">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
      {scene ? (
        <SceneSlot
          route={scene}
          board={board ?? null}
          {...(sceneLabel !== undefined && { label: sceneLabel })}
          className="w-full lg:col-span-6"
        />
      ) : null}
    </Container>
  );
}
