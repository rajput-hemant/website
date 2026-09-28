import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  Vector2,
  Vector4,
  type ShaderMaterial,
} from "three";

import type { AccentColors } from "@/lib/lab/types";

import type { WordmarkSample } from "./sample-wordmark";
import { RIPPLE_COUNT } from "./shaders";

/* Particles a little smaller than the gap between them: an even stipple with the page showing through. */
const PARTICLE_TO_SPACING = 1;

export type SignatureUniforms = {
  uTime: { value: number };
  uProgress: { value: number };
  uPointer: { value: Vector2 };
  uPointerStrength: { value: number };
  /** Ring buffer of ripples: x, y, start time, amplitude. */
  uRipples: { value: Vector4[] };
  uScale: { value: number };
  uSize: { value: number };
  uResolution: { value: number };
  uColorA: { value: Color };
  uColorB: { value: Color };
  uOpacity: { value: number };
};

export type SignatureMaterial = ShaderMaterial & {
  uniforms: SignatureUniforms;
};

export function createSignatureUniforms(): SignatureUniforms {
  return {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPointer: { value: new Vector2(10, 10) },
    uPointerStrength: { value: 0 },
    uRipples: {
      value: Array.from(
        { length: RIPPLE_COUNT },
        () => new Vector4(0, 0, -100, 0)
      ),
    },
    uScale: { value: 1 },
    uSize: { value: 0.005 },
    uResolution: { value: 1 },
    uColorA: { value: new Color() },
    uColorB: { value: new Color() },
    uOpacity: { value: 1 },
  };
}

/** Light pages get darker particles laid over the page; dark pages get light ones that add up where they overlap. */
export function applyTheme(material: SignatureMaterial, colors: AccentColors) {
  const dark = colors.theme === "dark";
  material.uniforms.uColorA.value.set(colors.accent);
  material.uniforms.uColorB.value.set(colors.foreground);
  material.uniforms.uOpacity.value = dark ? 0.95 : 0.92;
  const blending = dark ? AdditiveBlending : NormalBlending;
  if (material.blending !== blending) {
    material.blending = blending;
    material.needsUpdate = true;
  }
}

/** Share of the stage width the word spans (less on very wide stages, where height limits it). */
export const WORD_TO_STAGE = 0.8;

/** Fits the word to the stage: 80% of its width, or 58% of its height on very wide stages. */
export function applyLayout(
  material: SignatureMaterial,
  sample: WordmarkSample,
  stage: { width: number; height: number; pixelHeight: number }
) {
  const { uniforms } = material;
  uniforms.uScale.value = Math.min(
    stage.width * WORD_TO_STAGE,
    (stage.height * 0.58) / sample.aspect
  );
  uniforms.uSize.value = sample.spacing * PARTICLE_TO_SPACING;
  uniforms.uResolution.value = stage.pixelHeight;
}

export function createSignatureGeometry(sample: WordmarkSample) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(sample.targets, 3));
  geometry.setAttribute("aScatter", new BufferAttribute(sample.scatter, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(sample.seeds, 4));
  return geometry;
}
