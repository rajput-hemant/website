import * as React from "react";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/press/components/site/scene-slot";
import { SHEET_COUNT } from "@/flavors/press/content";
import { pad2 } from "@/flavors/press/lib/proof";
import { cn } from "@/flavors/press/lib/utils";

import { Container } from "./container";
import { Overprint } from "./overprint";

export type Meta = { label: string; value: React.ReactNode };

/**
 * The head of every inner sheet: its number in the set and what it is, the
 * title in two plates (pointing at it pulls the whole sheet into register),
 * a lede and the key facts. The press sits on the right.
 */
export function PageHeader({
  sheet,
  kicker,
  title,
  lede,
  meta,
  scene,
  children,
}: {
  /** The sheet number, or null for a page outside the set. */
  sheet: number | null;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: Meta[];
  scene: SceneRoute | null;
  children?: React.ReactNode;
}) {
  return (
    <Container
      className={cn(
        "grid gap-x-6 gap-y-10 pt-[clamp(2rem,1rem+3vw,4rem)]",
        scene && "lg:grid-cols-12 lg:items-end"
      )}
    >
      <div className={cn("min-w-0", scene && "lg:col-span-7")}>
        <p className="slug">
          {sheet ? (
            <>
              Sheet {pad2(sheet)} of {pad2(SHEET_COUNT)} &nbsp;/&nbsp;{" "}
            </>
          ) : null}
          {kicker}
        </p>
        <Overprint
          as="h1"
          data-register
          data-scene-item="register"
          className="mt-5 -ml-[0.04em] cursor-crosshair pb-[0.08em] text-display [overflow-wrap:anywhere]"
        >
          {title}
        </Overprint>
        {lede ? (
          <div className="mt-7 max-w-[44ch] text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] leading-[1.18] font-medium tracking-[-0.015em]">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-rule pt-4 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="slug">{item.label}</dt>
                <dd className="mt-1 font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
      {scene ? (
        <SceneSlot
          route={scene}
          className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
        />
      ) : null}
    </Container>
  );
}
