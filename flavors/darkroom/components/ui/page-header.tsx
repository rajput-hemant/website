import * as React from "react";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/darkroom/components/site/scene-slot";
import { ROLL } from "@/flavors/darkroom/lib/roll";
import { cn } from "@/flavors/darkroom/lib/utils";

import { Container } from "./container";

export type Meta = { label: string; value: React.ReactNode };

/**
 * The head of every inner page: its frame on the roll and what it is in the
 * darkroom, the title, a lede and the key facts. The developer tray sits on
 * the right with this page's print in it.
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
  /** The page's frame number on the roll (`01`), or null for a page off the roll. */
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
        <p className="edge">
          Roll {ROLL}
          {frame ? (
            <>
              {" "}
              <span aria-hidden>/</span> ▸{frame}
            </>
          ) : null}{" "}
          <span aria-hidden>/</span> {kicker}
        </p>
        <h1 className="mt-5 -ml-[0.04em] text-display [overflow-wrap:anywhere]">
          {title}
        </h1>
        {lede ? (
          <div className="mt-7 max-w-[34ch] text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] leading-[1.24] font-medium tracking-[-0.018em]">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-4 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="edge">{item.label}</dt>
                <dd className="mt-1 font-semibold">{item.value}</dd>
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
