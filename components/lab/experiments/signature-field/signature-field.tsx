"use client";

import { CanvasStage } from "@/components/lab/canvas-stage";
import type { ExperimentSceneProps } from "@/components/lab/types";

import { SignatureFieldScene } from "./signature-field-scene";

/** Entry point loaded with `next/dynamic`; this is the only module graph that pulls in three.js. */
export function SignatureField({ onReady }: ExperimentSceneProps) {
  return (
    <CanvasStage>
      <SignatureFieldScene onReady={onReady} />
    </CanvasStage>
  );
}
