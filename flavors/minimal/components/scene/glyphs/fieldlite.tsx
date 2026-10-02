import * as React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { extend, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  PerspectiveCamera as Camera,
  NormalBlending,
  Points,
  ShaderMaterial,
} from "three";

import {
  createField,
  maybeRipple,
  movePointer,
  releasePointer,
  stepField,
} from "@/lib/lab/signature-field/field";
import {
  sampleWordmark,
  type WordmarkSample,
} from "@/lib/lab/signature-field/sample-wordmark";
import {
  fragmentShader,
  vertexShader,
} from "@/lib/lab/signature-field/shaders";
import {
  applyLayout,
  createSignatureGeometry,
  createSignatureUniforms,
  WORD_TO_STAGE,
  type SignatureMaterial,
} from "@/lib/lab/signature-field/signature-material";

import {
  hovered,
  motionState,
  palette,
  useAnchor,
  useGlyphFrame,
  watchPalette,
} from "../kit";

extend({ PerspectiveCamera: Camera, Points, ShaderMaterial });

/** Fov of the glyph's own camera; its distance is set so one unit is one pixel. */
const FOV = 30;
const HALF_FOV = (FOV * Math.PI) / 360;

/** The stage's density rule, at the glyph's smaller word. */
const spacing = (wordWidthPx: number) =>
  Math.min(4.5, Math.max(2.4, wordWidthPx / 210));

/** The family the edition's serif class resolves to. */
function serifFamily() {
  const probe = document.createElement("span");
  probe.className = "font-serif";
  document.body.append(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || "serif";
}

/**
 * L1: the lab index's live poster. The signature-field particles at a
 * fraction of the stage's count, drawn over the experiment's static poster
 * while the pointer or focus is on its row, and paused on leave (the last
 * frame stays). The same shader and material as the stage. Fine pointers at
 * tier 2 only; elsewhere the poster is all there is.
 */
export function Fieldlite() {
  const { el } = useAnchor();
  const invalidate = useThree((state) => state.invalidate);
  const camera = React.useRef<Camera>(null);
  const [sample, setSample] = React.useState<WordmarkSample | null>(null);
  const [uniforms] = React.useState(createSignatureUniforms);
  const material = React.useRef<SignatureMaterial>(null);
  const geometry = React.useMemo(
    () => sample && createSignatureGeometry(sample),
    [sample]
  );
  const field = React.useRef(createField());
  const pointer = React.useRef<{ x: number; y: number } | null>(null);

  // Sample the word once the glyph is first about to be shown.
  const sampling = React.useRef(false);
  const sampleOnce = React.useCallback((glyph: HTMLElement) => {
    if (sampling.current) return;
    sampling.current = true;
    const word = glyph.dataset.glyphWord ?? "";
    const wordWidthPx = glyph.clientWidth * WORD_TO_STAGE;
    if (!word || wordWidthPx <= 0) return;
    sampleWordmark({
      text: word,
      wordWidthPx,
      spacingPx: spacing(wordWidthPx),
      fontFamily: serifFamily(),
    })
      .then(setSample)
      .catch(() => {
        // Without samples the static poster stays.
      });
  }, []);

  React.useEffect(() => {
    watchPalette();
  }, []);
  React.useEffect(() => () => geometry?.dispose(), [geometry]);

  // Pointer over the row, in the glyph's word units (set per frame below).
  React.useEffect(() => {
    const row = el()?.closest("a");
    if (!row) return;
    const move = (e: Event) => {
      if (!(e instanceof PointerEvent) || e.pointerType === "touch") return;
      pointer.current = { x: e.clientX, y: e.clientY };
      invalidate();
    };
    const leave = () => {
      pointer.current = null;
      releasePointer(field.current);
      invalidate();
    };
    row.addEventListener("pointermove", move, { passive: true });
    row.addEventListener("pointerleave", leave);
    return () => {
      row.removeEventListener("pointermove", move);
      row.removeEventListener("pointerleave", leave);
    };
  }, [el, invalidate]);

  useGlyphFrame((dt, glyph) => {
    const { tilt } = motionState();
    const hot = tilt && hovered()?.startsWith("lab:") === true;
    if (hot) sampleOnce(glyph);
    const mat = material.current;
    if (!mat || !sample) return hot;
    const r = glyph.getBoundingClientRect();
    const cam = camera.current;
    if (cam) {
      cam.position.z = r.height / 2 / Math.tan(HALF_FOV);
      cam.far = cam.position.z * 2;
      cam.updateProjectionMatrix();
    }
    const dark = palette.paper.r + palette.paper.g + palette.paper.b < 1.5;
    mat.uniforms.uColorA.value.copy(palette.accent);
    mat.uniforms.uColorB.value.copy(palette.ink);
    mat.uniforms.uOpacity.value = dark ? 0.95 : 0.92;
    const blending = dark ? AdditiveBlending : NormalBlending;
    if (mat.blending !== blending) {
      mat.blending = blending;
      mat.needsUpdate = true;
    }
    applyLayout(mat, sample, {
      width: r.width,
      height: r.height,
      pixelHeight: r.height * devicePixelRatio,
    });

    const f = field.current;
    const scale = mat.uniforms.uScale.value;
    if (hot && pointer.current) {
      movePointer(
        f,
        (pointer.current.x - r.left - r.width / 2) / scale,
        (r.top + r.height / 2 - pointer.current.y) / scale
      );
      maybeRipple(f, mat.uniforms.uRipples.value, 0.8);
    }
    // Paused on leave: the field only advances while the row is hot.
    const moving = hot ? stepField(f, Math.min(dt, 1 / 15)) : false;
    mat.uniforms.uTime.value = f.time;
    mat.uniforms.uProgress.value = f.progress;
    mat.uniforms.uPointer.value.set(f.pointerX, f.pointerY);
    mat.uniforms.uPointerStrength.value = f.strength;
    return moving || hot;
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={FOV} near={1} />
      {geometry && (
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={material}
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
      )}
    </>
  );
}
