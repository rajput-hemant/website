"use client";

import { useAccent } from "@/flavors/minimal/components/lab/use-accent";

import type { ExperimentSceneProps } from "@/lib/lab/types";
import { CanvasStage } from "@/components/semantic/lab/canvas-stage";
import { SignatureFieldScene } from "@/components/semantic/lab/signature-field-scene";

/** Entry point loaded with `next/dynamic`; this is the only module graph that pulls in three.js. */
export function SignatureField({ onReady }: ExperimentSceneProps) {
  const colors = useAccent();
  return (
    <CanvasStage>
      <SignatureFieldScene
        onReady={onReady}
        colors={colors}
        fontClass="font-serif"
      />
    </CanvasStage>
  );
}
