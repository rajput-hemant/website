"use client";

import type * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import {
  InspectControl,
  InspectHint,
} from "@/components/semantic/scene/inspect-control";

/**
 * The desk's keyboard twin and one-time hint, beside the host. On home the
 * host stops short of the drawers nav, so they centre on it.
 */
export default function InspectDom({
  target,
  home,
}: {
  target: React.RefObject<HTMLElement | null>;
  home: boolean;
}) {
  return (
    <>
      <InspectControl
        target={target}
        className={cn(
          "pointer-events-none absolute bottom-[4%] left-1/2 z-20 flex -translate-x-1/2 gap-1 opacity-0 focus-within:bg-ground/90 focus-within:opacity-100",
          home && "md:left-[calc(50%-95px)]"
        )}
        buttonClassName="size-11 border border-line-strong text-lg text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
      />
      <InspectHint
        target={target}
        className={cn(
          "pointer-events-none absolute bottom-[12%] left-1/2 z-20 m-0 -translate-x-1/2 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] whitespace-nowrap text-ink-soft uppercase",
          home && "md:left-[calc(50%-95px)]"
        )}
      />
    </>
  );
}
