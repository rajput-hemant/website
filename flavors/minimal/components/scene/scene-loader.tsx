"use client";

import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/**
 * Renders inside the lead glyph: the host the shared mount hook lends the
 * session canvas to. The canvas is fixed behind the chrome and never takes
 * pointer events; a glyph that listens (a drag) lets them reach its own box.
 */
export function SceneLoader({
  kind,
  input = false,
}: {
  kind: string;
  input?: boolean;
}) {
  const { rootRef, hostRef } = useSceneMount(kind, importScene);
  return (
    <div
      ref={rootRef}
      data-scene-root
      className={cn("absolute inset-0", !input && "pointer-events-none")}
    >
      <div ref={hostRef} aria-hidden className="absolute inset-0" />
    </div>
  );
}
