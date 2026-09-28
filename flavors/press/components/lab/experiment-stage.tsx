"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/press/lib/prefs-store";
import { cn } from "@/flavors/press/lib/utils";

import type { LabSlug } from "@/content/lab";
import type { ExperimentSceneProps } from "@/lib/lab/types";
import { useWebGLSupport } from "@/lib/lab/use-webgl-support";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

import { posters } from "./experiments";

/* `ssr: false` keeps three.js out of every server bundle and every route without a stage. */
const scenes = {
  "signature-field": dynamic(
    () => import("./signature-field").then((m) => m.SignatureField),
    { ssr: false }
  ),
} satisfies Record<LabSlug, React.ComponentType<ExperimentSceneProps>>;

/**
 * A test sheet on the stone: the static poster underneath until the scene's
 * first frame, and all that renders under reduced motion or without WebGL.
 */
export function ExperimentStage({
  slug,
  label,
  hint,
  className,
}: {
  slug: LabSlug;
  label: string;
  hint?: string;
  className?: string;
}) {
  const Scene = scenes[slug];
  const Poster = posters[slug];
  const { motion } = usePrefs();
  const paused = usePrefersReducedMotion() || !motion;
  const webgl = useWebGLSupport();
  const show = webgl === true && !paused;
  const [ready, setReady] = React.useState(false);
  const [shown, setShown] = React.useState(show);
  const onReady = React.useCallback(() => setReady(true), []);
  if (shown !== show) {
    setShown(show);
    if (!show) setReady(false);
  }
  const note = paused
    ? "Motion paused"
    : webgl === false
      ? "WebGL is unavailable in this browser"
      : null;

  return (
    <figure className="m-0">
      <div
        className={cn("crop-marks relative bg-sheet shadow-sheet", className)}
      >
        <div
          role="img"
          aria-label={label}
          className="absolute inset-0 overflow-hidden"
        >
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              show && ready && "opacity-0"
            )}
          >
            <Poster />
          </div>
          {show ? (
            <div className="absolute inset-0">
              <Scene onReady={onReady} />
            </div>
          ) : null}
        </div>
        {note ? (
          <p className="absolute top-3 left-3 bg-yellow px-2 py-1 slug text-ink!">
            {note}
          </p>
        ) : null}
      </div>
      {hint && show ? (
        <figcaption className="mt-3 slug">{hint}</figcaption>
      ) : null}
    </figure>
  );
}
