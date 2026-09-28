import * as React from "react";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/mission/components/site/scene-slot";
import type { Board } from "@/flavors/mission/lib/scene/poses";
import { cn } from "@/flavors/mission/lib/utils";

import { Checklist, type ChecklistRow } from "./checklist";
import { Container } from "./container";

/**
 * The head of every inner page: its section number and what it is in the
 * flight plan, the title, a lede and the key facts as a checklist. Fig. 1
 * sits on the right behind a hairline: the globe, or a figure of the page's
 * own (a mission patch on a project).
 */
export function PageHeader({
  section,
  kicker,
  title,
  lede,
  meta,
  scene,
  figure,
  children,
}: {
  /** The section number, or null for a page outside the plan. */
  section: number | string | null;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: ChecklistRow[];
  scene?: { route: SceneRoute; board: Board; caption: string } | null;
  figure?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const aside = scene || figure;
  return (
    <Container
      className={cn(
        "grid gap-x-6 gap-y-10 pt-[clamp(1.75rem,1rem+2.5vw,3rem)]",
        aside && "lg:grid-cols-12"
      )}
    >
      <div className="min-w-0 lg:col-span-7">
        <p className="flex flex-wrap gap-x-3.5 gap-y-1 label text-ink-soft">
          {section !== null ? (
            <b className="font-semibold text-signal">
              {typeof section === "number" ? `${section}.0` : section}
            </b>
          ) : null}
          <span>{kicker}</span>
        </p>
        <h1 className="mt-6 -ml-[0.04em] text-display [overflow-wrap:anywhere]">
          {title}
        </h1>
        {lede ? (
          <div className="mt-7 max-w-[34ch] text-lead font-medium tracking-[-0.01em]">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <Checklist rows={meta} className="mt-9 max-w-xl" />
        ) : null}
        {children}
      </div>
      {scene ? (
        <SceneSlot
          route={scene.route}
          board={scene.board}
          caption={scene.caption}
          className="mx-auto w-full max-w-[26rem] lg:col-span-5 lg:mx-0 lg:max-w-none lg:border-l lg:border-rule lg:pl-6"
        />
      ) : figure ? (
        <div className="lg:col-span-5 lg:border-l lg:border-rule lg:pl-6">
          {figure}
        </div>
      ) : null}
    </Container>
  );
}
