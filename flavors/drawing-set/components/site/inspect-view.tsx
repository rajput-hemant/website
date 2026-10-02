"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import {
  InspectControl,
  InspectHint,
} from "@/components/semantic/scene/inspect-control";

import { SceneView } from "./scene-view";

/**
 * A tracked view that can be turned and zoomed (`lib/scene/inspect.ts`): the
 * placeholder fills its frame, with the keyboard twin and the one-time hint
 * beside it (never inside), both shown only while the view is live.
 */
export function InspectView(props: React.ComponentProps<typeof SceneView>) {
  const host = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <SceneView
        {...props}
        ref={host}
        className={cn(
          "cursor-grab data-[inspect=drag]:cursor-grabbing",
          props.className
        )}
      />
      <InspectControl
        target={host}
        className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 focus-within:bg-ground/90 focus-within:opacity-100"
        buttonClassName="size-11 border border-line-strong text-lg text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
      />
      <InspectHint
        target={host}
        className="pointer-events-none absolute bottom-14 left-1/2 z-10 m-0 -translate-x-1/2 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] whitespace-nowrap text-ink-soft uppercase"
      />
    </>
  );
}
