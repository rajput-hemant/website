"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SignatureFieldFallback } from "@/flavors/surface/components/lab/experiments/signature-field/signature-field-fallback";
import { cn } from "@/flavors/surface/lib/utils";

import type { LabSlug } from "@/content/lab";
import type { ExperimentSceneProps } from "@/lib/lab/types";
import { useWebGLSupport } from "@/lib/lab/use-webgl-support";
import { useMotionOn } from "@/components/semantic/use-root-data";

type Experiment = {
  Scene: React.ComponentType<ExperimentSceneProps>;
  Fallback: React.ComponentType<{ className?: string }>;
};

/* `ssr: false` keeps three.js out of every server bundle and out of any route that never renders a stage. */
const experiments = {
  "signature-field": {
    Scene: dynamic(
      () =>
        import("./experiments/signature-field/signature-field").then(
          (module) => module.SignatureField
        ),
      { ssr: false }
    ),
    Fallback: SignatureFieldFallback,
  },
} satisfies Record<LabSlug, Experiment>;

type ExperimentStageProps = {
  slug: LabSlug;
  /** Accessible description of what the canvas shows. */
  label: string;
  /** How to interact; shown below the stage only while the scene runs. */
  hint?: string;
  className?: string;
};

/**
 * Hosts one experiment. The static fallback is server-rendered and stays
 * underneath until the scene's first frame, and it is all that renders under
 * reduced motion or without WebGL.
 */
export function ExperimentStage({
  slug,
  label,
  hint,
  className,
}: ExperimentStageProps) {
  const { Scene, Fallback } = experiments[slug];
  const reducedMotion = !useMotionOn();
  const webgl = useWebGLSupport();
  const showScene = webgl === true && !reducedMotion;
  const [ready, setReady] = React.useState(false);
  const [sceneShown, setSceneShown] = React.useState(showScene);
  const onReady = React.useCallback(() => setReady(true), []);

  if (sceneShown !== showScene) {
    setSceneShown(showScene);
    if (!showScene) setReady(false);
  }
  const note = reducedMotion
    ? "Motion paused"
    : webgl === false
      ? "WebGL is unavailable in this browser"
      : null;

  return (
    <div>
      <div className={cn("relative overflow-hidden", className)}>
        <div role="img" aria-label={label} className="absolute inset-0">
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              showScene && ready && "opacity-0"
            )}
          >
            <Fallback />
          </div>
          {showScene && (
            <div className="absolute inset-0">
              <Scene onReady={onReady} />
            </div>
          )}
        </div>
        {note && (
          <p className="legend absolute right-3 bottom-3 text-lcd-ink-2">
            {note}
          </p>
        )}
      </div>
      {hint && showScene && (
        <p className="legend mt-3 max-w-prose tracking-[0.04em] normal-case">
          {hint}
        </p>
      )}
    </div>
  );
}
