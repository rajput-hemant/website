"use client";

import dynamic from "next/dynamic";

import { useIdleReady } from "@/components/semantic/use-idle-ready";

const DeferredLayers = dynamic(
  () => import("./deferred-layers").then((mod) => mod.DeferredLayers),
  { ssr: false }
);

/** Mounts the motion and pointer stack once the browser is idle after hydration. */
export function DeferredShell() {
  return useIdleReady() ? <DeferredLayers /> : null;
}
