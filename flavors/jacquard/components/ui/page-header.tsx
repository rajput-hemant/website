import * as React from "react";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/jacquard/components/site/scene-slot";
import { CARD_COUNT } from "@/flavors/jacquard/content";
import type { Weave } from "@/flavors/jacquard/lib/scene/poses";
import { cn } from "@/flavors/jacquard/lib/utils";
import { pad2 } from "@/flavors/jacquard/lib/weave";

import { Container } from "./container";
import { MuseumLabel, type LabelRow } from "./museum-label";

/**
 * The head of every inner page: its card in the chain and what it is, the
 * title in museum-label caps, a lede and the key facts as an object label.
 * The cloth hangs on the right, woven from what the page is about.
 */
export function PageHeader({
  card,
  kicker,
  title,
  lede,
  meta,
  scene,
  children,
}: {
  /** The card number, or null for a page outside the chain. */
  card: number | null;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: LabelRow[];
  scene: { route: SceneRoute; weave: Weave; caption: string } | null;
  children?: React.ReactNode;
}) {
  return (
    <Container
      className={cn(
        "grid gap-x-14 gap-y-10 pt-[clamp(2rem,1rem+3vw,3.5rem)]",
        scene && "lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end"
      )}
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 label">
          {card ? (
            <>
              <span>
                Card {pad2(card)} of {pad2(CARD_COUNT)}
              </span>
              <span aria-hidden className="h-px w-3.5 bg-rule-strong" />
            </>
          ) : null}
          <span>{kicker}</span>
        </p>
        <h1 className="mt-6 -ml-[0.04em] text-display [overflow-wrap:anywhere]">
          {title}
        </h1>
        {lede ? (
          <div className="mt-7 max-w-[40ch] text-lead font-medium tracking-[-0.012em]">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <MuseumLabel rows={meta} className="mt-9 max-w-xl" />
        ) : null}
        {children}
      </div>
      {scene ? (
        <SceneSlot
          route={scene.route}
          weave={scene.weave}
          caption={scene.caption}
          className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-none"
        />
      ) : null}
    </Container>
  );
}
