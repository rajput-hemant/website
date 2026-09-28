"use client";

import dynamic from "next/dynamic";

/*
 * The loader and the shared scene store are not needed for first paint:
 * the poster already fills the slot, and the scene itself waits for load
 * and idle. So they stay out of the initial chunks too.
 */
export const LazySceneLoader = dynamic(
  () => import("./scene-loader").then((mod) => mod.SceneLoader),
  { ssr: false }
);
