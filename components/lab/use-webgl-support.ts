"use client";

import { useSyncExternalStore } from "react";

let supported: boolean | undefined;

function detectWebGL(): boolean {
  if (supported !== undefined) return supported;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    supported = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }
  return supported;
}

const subscribe = () => () => {};

/** `null` during SSR and hydration, then whether the browser can create a WebGL context. */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(subscribe, detectWebGL, () => null);
}
