export type Tier = 0 | 1 | 2;

export type TierSignals = {
  webgl: boolean;
  saveData: boolean;
  reducedData: boolean;
  scene: string;
  deviceMemory: number;
  coarse: boolean;
};

/** 0: the printed knob only. 1: 3D at DPR 1 without antialiasing. 2: full. */
export function pickTier(s: TierSignals): Tier {
  if (s.scene === "off" || !s.webgl || s.saveData || s.reducedData) return 0;
  if (s.scene === "low" || s.deviceMemory <= 4 || s.coarse) return 1;
  return 2;
}

let webgl: boolean | undefined;

function hasWebGL() {
  if (webgl !== undefined) return webgl;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

export function detectTier(): Tier {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const scene = document.documentElement.dataset.scene ?? "auto";
  return pickTier({
    scene,
    webgl: scene !== "off" && hasWebGL(),
    saveData: !!nav.connection?.saveData,
    reducedData: matchMedia("(prefers-reduced-data: reduce)").matches,
    deviceMemory: nav.deviceMemory ?? 8,
    coarse: matchMedia("(pointer: coarse)").matches,
  });
}
