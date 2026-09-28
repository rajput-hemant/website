"use client";

import type { ExperimentSceneProps } from "@/lib/lab/types";
import { CanvasStage } from "@/components/semantic/lab/canvas-stage";
import { SignatureFieldScene } from "@/components/semantic/lab/signature-field-scene";

import { useAccent } from "./use-accent";

/** Loaded with `next/dynamic`; the only module graph that pulls in three.js here. */
export function SignatureField({ onReady }: ExperimentSceneProps) {
  const colors = useAccent();
  return (
    <CanvasStage>
      <SignatureFieldScene
        onReady={onReady}
        colors={colors}
        fontClass="font-sans"
      />
    </CanvasStage>
  );
}
