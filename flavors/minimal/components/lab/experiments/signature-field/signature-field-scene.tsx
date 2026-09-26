"use client";

import * as React from "react";
import { useStage } from "@/flavors/minimal/components/lab/canvas-stage";
import type { ExperimentSceneProps } from "@/flavors/minimal/components/lab/types";
import { useAccent } from "@/flavors/minimal/components/lab/use-accent";
import { useFrame, useThree } from "@react-three/fiber";

import {
  createField,
  maybeRipple,
  movePointer,
  releasePointer,
  stepField,
} from "./field";
import { sampleWordmark, type WordmarkSample } from "./sample-wordmark";
import { fragmentShader, vertexShader } from "./shaders";
import {
  applyLayout,
  applyTheme,
  createSignatureGeometry,
  createSignatureUniforms,
  WORD_TO_STAGE,
  type SignatureMaterial,
} from "./signature-material";
import { WORD } from "./word";

/* A frame after an idle stretch reports a huge delta; clamping keeps motion continuous, and 1/15 s lets slow devices keep real time. */
const MAX_STEP = 1 / 15;

function resolveSerifFamily() {
  const probe = document.createElement("span");
  probe.className = "font-serif";
  document.body.append(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || "serif";
}

/** A little tighter on small screens so thin strokes still hold enough particles. */
function particleSpacing(wordWidthPx: number) {
  return Math.min(4.5, Math.max(2.4, wordWidthPx / 210));
}

export function SignatureFieldScene({ onReady }: ExperimentSceneProps) {
  const { active, setMoving } = useStage();
  const colors = useAccent();
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const getState = useThree((state) => state.get);
  const viewport = useThree((state) => state.viewport);
  const height = useThree((state) => state.size.height);

  const [sample, setSample] = React.useState<WordmarkSample | null>(null);
  const [uniforms] = React.useState(createSignatureUniforms);
  const materialRef = React.useRef<SignatureMaterial>(null);
  const geometry = React.useMemo(
    () => sample && createSignatureGeometry(sample),
    [sample]
  );
  const field = React.useRef(createField());
  const reported = React.useRef(false);
  const onReadyRef = React.useRef(onReady);

  React.useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  React.useEffect(() => {
    let cancelled = false;
    const wordWidthPx = domElement.clientWidth * WORD_TO_STAGE;
    sampleWordmark({
      text: WORD,
      wordWidthPx,
      spacingPx: particleSpacing(wordWidthPx),
      fontFamily: resolveSerifFamily(),
    })
      .then((result) => {
        if (!cancelled) setSample(result);
      })
      .catch(() => {
        // Without glyph samples the static wordmark underneath stays visible.
      });
    return () => {
      cancelled = true;
    };
  }, [domElement]);

  React.useEffect(() => () => geometry?.dispose(), [geometry]);

  React.useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    applyTheme(material, colors);
    invalidate();
  }, [geometry, colors, invalidate]);

  React.useEffect(() => {
    const material = materialRef.current;
    if (!sample || !material) return;
    applyLayout(material, sample, {
      width: viewport.width,
      height: viewport.height,
      pixelHeight: height * viewport.dpr,
    });
    invalidate();
  }, [sample, viewport, height, invalidate]);

  React.useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  React.useEffect(() => {
    const state = field.current;

    const toWordUnits = (event: PointerEvent) => {
      const rect = domElement.getBoundingClientRect();
      const { width, height } = getState().viewport;
      const scale = materialRef.current?.uniforms.uScale.value ?? 1;
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * width;
      const y = (0.5 - (event.clientY - rect.top) / rect.height) * height;
      return [x / scale, y / scale] as const;
    };

    const ripple = (amplitude: number, force?: boolean) => {
      const ripples = materialRef.current?.uniforms.uRipples.value;
      if (ripples) maybeRipple(state, ripples, amplitude, force);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" && event.buttons === 0) return;
      movePointer(state, ...toWordUnits(event));
      ripple(0.8);
      invalidate();
    };
    const onDown = (event: PointerEvent) => {
      movePointer(state, ...toWordUnits(event));
      ripple(1.3, true);
      invalidate();
    };
    const onRelease = (event: PointerEvent) => {
      if (event.type === "pointerup" && event.pointerType !== "touch") return;
      releasePointer(state);
      invalidate();
    };

    domElement.addEventListener("pointermove", onMove);
    domElement.addEventListener("pointerdown", onDown);
    domElement.addEventListener("pointerup", onRelease);
    domElement.addEventListener("pointercancel", onRelease);
    domElement.addEventListener("pointerleave", onRelease);
    return () => {
      domElement.removeEventListener("pointermove", onMove);
      domElement.removeEventListener("pointerdown", onDown);
      domElement.removeEventListener("pointerup", onRelease);
      domElement.removeEventListener("pointercancel", onRelease);
      domElement.removeEventListener("pointerleave", onRelease);
    };
  }, [domElement, getState, invalidate]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const current = field.current;
    const moving = stepField(current, Math.min(delta, MAX_STEP));

    const { uniforms } = material;
    uniforms.uTime.value = current.time;
    uniforms.uProgress.value = current.progress;
    uniforms.uPointer.value.set(current.pointerX, current.pointerY);
    uniforms.uPointerStrength.value = current.strength;

    if (moving) state.invalidate();
    if (moving !== current.moving) {
      current.moving = moving;
      setMoving(moving);
    }
    if (!reported.current) {
      reported.current = true;
      onReadyRef.current();
    }
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        args={[
          {
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,
          },
        ]}
      />
    </points>
  );
}
