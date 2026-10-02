"use client";

import { useAccent } from "@/flavors/minimal/components/lab/use-accent";

import type { ExperimentSceneProps } from "@/lib/lab/types";
import { CanvasStage } from "@/components/semantic/lab/canvas-stage";
import { SignatureFieldScene } from "@/components/semantic/lab/signature-field-scene";

import { BottleView, InkBottle, SideInset } from "./stage-views";

/** Entry point loaded with `next/dynamic`; this is the only module graph that pulls in three.js. */
export function SignatureField({ onReady }: ExperimentSceneProps) {
  const colors = useAccent();
  return (
    <CanvasStage
      passes
      overlay={
        <div className="pointer-events-none absolute inset-0">
          <InkBottle />
          <div
            aria-hidden
            data-stage-inset
            className="pointer-events-auto absolute top-3 right-3 size-24 cursor-ew-resize touch-pan-y rounded-md border border-hairline"
          />
        </div>
      }
    >
      <SignatureFieldScene
        onReady={onReady}
        colors={colors}
        fontClass="font-serif"
      />
      <BottleView colors={colors} />
      <SideInset />
    </CanvasStage>
  );
}
