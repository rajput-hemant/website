import type { Tier } from "./store";

export type TierSignals = {
  webgl2: boolean;
  saveData: boolean;
  reducedData: boolean;
  scene: string;
  deviceMemory: number;
  coarse: boolean;
};

export function pickTier(s: TierSignals): Tier {
  if (s.scene === "off" || !s.webgl2 || s.saveData || s.reducedData) return 0;
  if (s.scene === "low" || s.deviceMemory <= 4 || s.coarse) return 1;
  return 2;
}

let webgl2: boolean | undefined;

function hasWebGL2() {
  if (webgl2 !== undefined) return webgl2;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl2 = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
}

export function detectTier(): Tier {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const scene = document.documentElement.dataset.scene ?? "auto";
  return pickTier({
    scene,
    // "off" never creates a probe context.
    webgl2: scene !== "off" && hasWebGL2(),
    saveData: !!nav.connection?.saveData,
    reducedData: matchMedia("(prefers-reduced-data: reduce)").matches,
    deviceMemory: nav.deviceMemory ?? 8,
    coarse: matchMedia("(pointer: coarse)").matches,
  });
}
