"use client";

import * as React from "react";
import { accentPresets, type AccentPreset } from "@/flavors/minimal/lib/prefs";
import { setPrefs, usePrefs } from "@/flavors/minimal/lib/prefs-store";
import { Edges } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  type Camera,
} from "three";

import type { AccentColors } from "@/lib/lab/types";
import { useStage } from "@/components/semantic/lab/canvas-stage";

const presets = Object.entries(accentPresets) as [AccentPreset, number][];

/** The preset whose hue is nearest `hue`. */
function nearest(hue: number) {
  let best = 0;
  let gap = Infinity;
  presets.forEach(([, value], index) => {
    const d = Math.abs(((value - hue + 540) % 360) - 180);
    if (d < gap) {
      gap = d;
      best = index;
    }
  });
  return best;
}

/** Pixels of vertical drag per step through the presets. */
const STEP_PX = 26;

/**
 * X1: the ink bottle, whose ink is the accent. A vertical drag scrubs the
 * accent through the presets and the field recolours live. The box is a real
 * `role="slider"` as well: arrows, Home and End work, so it isn't pointer-only.
 * This is its DOM box; {@link BottleView} draws into it, in the stage's canvas.
 */
export function InkBottle() {
  const { accentHue } = usePrefs();
  const index = nearest(accentHue);
  const preset = presets[index]?.[0] ?? "ember";
  const drag = React.useRef<{ y: number; from: number } | null>(null);

  const go = (next: number) => {
    const hue = presets[Math.min(presets.length - 1, Math.max(0, next))]?.[1];
    if (hue !== undefined && hue !== accentHue) setPrefs({ accentHue: hue });
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Accent colour"
      aria-orientation="vertical"
      aria-valuemin={1}
      aria-valuemax={presets.length}
      aria-valuenow={index + 1}
      aria-valuetext={preset}
      data-ink-bottle
      className="pointer-events-auto absolute bottom-3 left-3 h-24 w-14 cursor-grab touch-none rounded-md outline-offset-2 active:cursor-grabbing"
      onPointerDown={(e) => {
        drag.current = { y: e.clientY, from: index };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const start = drag.current;
        if (!start) return;
        go(start.from + Math.round((start.y - e.clientY) / STEP_PX));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(e) => {
        const next =
          e.key === "ArrowUp" || e.key === "ArrowRight"
            ? index + 1
            : e.key === "ArrowDown" || e.key === "ArrowLeft"
              ? index - 1
              : e.key === "Home"
                ? 0
                : e.key === "End"
                  ? presets.length - 1
                  : null;
        if (next === null) return;
        e.preventDefault();
        go(next);
      }}
    ></div>
  );
}

function Bottle({ colors }: { colors: AccentColors }) {
  const invalidate = useThree((state) => state.invalidate);
  const ink = React.useMemo(() => new Color(colors.accent), [colors.accent]);
  const line = React.useMemo(
    () => new Color(colors.foreground),
    [colors.foreground]
  );
  React.useEffect(() => invalidate(), [ink, line, invalidate]);
  return (
    <>
      <group rotation={[-0.25, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 1.9, 20]} />
          <meshBasicMaterial color={ink} transparent opacity={0.9} />
          <Edges threshold={30} color={line} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.32, 0.5, 0.5, 16]} />
          <meshBasicMaterial color={ink} />
          <Edges threshold={30} color={line} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.6, 0.45, 0.6]} />
          <meshBasicMaterial color={line} />
        </mesh>
      </group>
    </>
  );
}

/**
 * One more pass over the stage's canvas, scissored to the box of `selector`:
 * a second view in the same canvas, no second canvas or context.
 */
function useViewPass(
  selector: string,
  scene: Scene,
  camera: Camera,
  priority: number,
  aim: (aspect: number) => void
) {
  const { active } = useStage();
  useFrame(({ gl }) => {
    const box = document.querySelector<HTMLElement>(selector);
    if (!box || !active) return;
    const canvas = gl.domElement.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    aim(r.width / r.height);
    const left = r.left - canvas.left;
    const bottom = canvas.bottom - r.bottom;
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setViewport(left, bottom, r.width, r.height);
    gl.setScissor(left, bottom, r.width, r.height);
    gl.setScissorTest(true);
    gl.clear(true, true);
    gl.render(scene, camera);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, canvas.width, canvas.height);
    gl.autoClear = autoClear;
  }, priority);
}

function fitAspect(camera: PerspectiveCamera, aspect: number) {
  if (camera.aspect === aspect) return;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}

/** X1's drawing: the bottle on its own small scene and camera. */
export function BottleView({ colors }: { colors: AccentColors }) {
  const [scene] = React.useState(() => new Scene());
  const [camera] = React.useState(() => {
    const cam = new PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 0, 9);
    return cam;
  });
  useViewPass("[data-ink-bottle]", scene, camera, 1, (aspect) =>
    fitAspect(camera, aspect)
  );
  return createPortal(<Bottle colors={colors} />, scene);
}

/** Half the inset's span in world units: the field's height with a margin. */
const SPAN = 1.6;
const DISTANCE = 10;
/** Almost edge-on: the field reads as a ribbon, and turns into a plane as you drag. */
const REST_YAW = (72 * Math.PI) / 180;
const MAX_TURN = (60 * Math.PI) / 180;

/**
 * X2: a side view of the same particle field, a second pass over the same
 * scene (the same geometry and material) through its own orthographic camera,
 * into the box of `[data-stage-inset]`. Dragging the box turns the camera up
 * to 60° either way. Mirrors the main view's pointer impulses edge-on for free.
 */
export function SideInset() {
  const invalidate = useThree((state) => state.invalidate);
  const scene = useThree((state) => state.scene);
  const [camera] = React.useState(
    () => new OrthographicCamera(-SPAN, SPAN, SPAN, -SPAN, 0.1, 40)
  );
  const turn = React.useRef(0);

  React.useEffect(() => {
    const box = document.querySelector<HTMLElement>("[data-stage-inset]");
    if (!box) return;
    let from: { x: number; turn: number } | null = null;
    const down = (e: PointerEvent) => {
      from = { x: e.clientX, turn: turn.current };
      box.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!from) return;
      const next = from.turn + ((e.clientX - from.x) / box.clientWidth) * 2;
      turn.current = Math.max(-MAX_TURN, Math.min(MAX_TURN, next));
      invalidate();
    };
    const up = () => {
      from = null;
    };
    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    return () => {
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
    };
  }, [invalidate]);

  useViewPass("[data-stage-inset]", scene, camera, 2, () => {
    const yaw = REST_YAW + turn.current;
    camera.position.set(Math.sin(yaw) * DISTANCE, 0, Math.cos(yaw) * DISTANCE);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
