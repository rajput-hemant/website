"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/maquette/lib/prefs-store";
import { cn } from "@/flavors/maquette/lib/utils";

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
 * A test on the bench: the static poster underneath until the scene's
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
      <div className={cn("relative bg-foam p-1.5 shadow-vitrine", className)}>
        <div
          role="img"
          aria-label={label}
          className="absolute inset-1.5 overflow-hidden"
        >
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-(--ease-chem)",
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
          <p className="absolute top-4 left-4 rounded-[2px] bg-ground px-2 py-1 caps text-ink!">
            {note}
          </p>
        ) : null}
      </div>
      {hint && show ? (
        <figcaption className="mt-3 caps">{hint}</figcaption>
      ) : null}
    </figure>
  );
}
