"use client";

import dynamic from "next/dynamic";

import { useIdle } from "@/components/semantic/use-idle";

const DeferredLayers = dynamic(
  () => import("./deferred-layers").then((mod) => mod.DeferredLayers),
  { ssr: false }
);

/** Mounts the motion and pointer stack once the browser is idle, so none of it is in the initial chunks. */
export function DeferredShell() {
  return useIdle() ? <DeferredLayers /> : null;
}
