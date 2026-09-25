'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
  Vector4,
} from 'three';
import {
  LabCanvas,
  useMarkReady,
  useSceneColors,
} from '~/components/lab/canvas';
import { useMotionEnabled } from '~/lib/prefs';
import { sampleWordmark } from './sample';
import {
  fragmentShader,
  INTRO_END,
  RIPPLE_LIFE,
  RIPPLES,
  vertexShader,
} from './shaders';
import { PlainWordmark } from './wordmark';

const STILL_TIME = 1e4;
const POINTER_FOLLOW = 12;
const HOVER_FOLLOW = 5;
const TAP_STRENGTH = 1.6;
const RIPPLE_GAP = 0.12;

function createUniforms() {
  return {
    uTime: { value: 0 },
    uSize: { value: 2 },
    uDpr: { value: 1 },
    uRadius: { value: 90 },
    uHalfWidth: { value: 1 },
    uPointer: { value: new Vector2() },
    uHover: { value: 0 },
    uRipples: {
      value: Array.from(
        { length: RIPPLES },
        () => new Vector4(0, 0, -STILL_TIME, 0),
      ),
    },
    uAccent: { value: new Color() },
    uInk: { value: new Color() },
  };
}

type Runtime = {
  uniforms: ReturnType<typeof createUniforms>;
  points: Points<BufferGeometry, ShaderMaterial>;
  pointer: { x: number; y: number; inside: boolean };
  lastRipple: { x: number; y: number; time: number };
  nextRipple: number;
  start: number | null;
};

function elapsed(runtime: Runtime) {
  return runtime.start === null
    ? 0
    : (performance.now() - runtime.start) / 1000;
}

export default function SignatureField() {
  const wordmark = useRef<HTMLSpanElement>(null);

  return (
    <LabCanvas fallback={<PlainWordmark ref={wordmark} />}>
      <Particles wordmark={wordmark} />
    </LabCanvas>
  );
}

function Particles({
  wordmark,
}: {
  wordmark: RefObject<HTMLSpanElement | null>;
}) {
  const scene = useThree((state) => state.scene);
  const canvas = useThree((state) => state.gl.domElement);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const dpr = useThree((state) => state.viewport.dpr);
  const invalidate = useThree((state) => state.invalidate);
  const markReady = useMarkReady();
  const motion = useMotionEnabled();
  const runtime = useRef<Runtime | null>(null);

  useLayoutEffect(() => {
    const uniforms = createUniforms();
    const points = new Points(
      new BufferGeometry(),
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    );
    points.frustumCulled = false;
    points.visible = false;
    scene.add(points);
    runtime.current = {
      uniforms,
      points,
      pointer: { x: 0, y: 0, inside: false },
      lastRipple: { x: 0, y: 0, time: -STILL_TIME },
      nextRipple: 0,
      start: null,
    };

    return () => {
      scene.remove(points);
      points.geometry.dispose();
      points.material.dispose();
      runtime.current = null;
    };
  }, [scene]);

  useSceneColors((accent, ink) => {
    if (!runtime.current) return;
    runtime.current.uniforms.uAccent.value.copy(accent);
    runtime.current.uniforms.uInk.value.copy(ink);
  });

  useLayoutEffect(() => {
    const element = wordmark.current;
    if (!element) return;
    let cancelled = false;
    const style = getComputedStyle(element);

    void document.fonts
      .load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`)
      .then(() => {
        const current = runtime.current;
        if (cancelled || !current) return;
        const field = sampleWordmark(element, canvas.getBoundingClientRect());
        const geometry = new BufferGeometry();
        geometry.setAttribute(
          'position',
          new BufferAttribute(field.positions, 3),
        );
        geometry.setAttribute('aSeed', new BufferAttribute(field.seeds, 4));
        current.points.geometry.dispose();
        current.points.geometry = geometry;
        current.points.visible = true;

        const { uniforms } = current;
        uniforms.uSize.value = field.step * 1.3;
        uniforms.uHalfWidth.value = width / 2;
        uniforms.uRadius.value = Math.min(
          120,
          Math.max(56, Math.min(width, height) * 0.16),
        );
        invalidate();
      });

    return () => {
      cancelled = true;
    };
  }, [canvas, height, invalidate, width, wordmark]);

  useEffect(() => {
    if (!runtime.current) return;
    runtime.current.uniforms.uDpr.value = dpr;
    invalidate();
  }, [dpr, invalidate]);

  useEffect(() => {
    invalidate();
    if (!motion) return;

    const ripple = (x: number, y: number, strength: number) => {
      const current = runtime.current;
      if (!current) return;
      const time = elapsed(current);
      current.uniforms.uRipples.value[current.nextRipple]?.set(
        x,
        y,
        time,
        strength,
      );
      current.nextRipple = (current.nextRipple + 1) % RIPPLES;
      current.lastRipple = { x, y, time };
    };

    const locate = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left - rect.width / 2,
        y: rect.height / 2 - (event.clientY - rect.top),
      };
    };

    const onMove = (event: PointerEvent) => {
      const current = runtime.current;
      if (!current) return;
      const { x, y } = locate(event);
      const { pointer, lastRipple, uniforms } = current;
      if (!pointer.inside) uniforms.uPointer.value.set(x, y);
      current.pointer = { x, y, inside: true };
      const radius = uniforms.uRadius.value;
      const travel = Math.hypot(x - lastRipple.x, y - lastRipple.y);
      if (travel > radius && elapsed(current) - lastRipple.time > RIPPLE_GAP) {
        ripple(x, y, Math.min(1, travel / (radius * 2)));
      }
      invalidate();
    };

    const onDown = (event: PointerEvent) => {
      const { x, y } = locate(event);
      ripple(x, y, TAP_STRENGTH);
      invalidate();
    };

    const onLeave = () => {
      if (runtime.current) runtime.current.pointer.inside = false;
      invalidate();
    };

    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerdown', onDown, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointercancel', onLeave);

    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
      onLeave();
    };
  }, [canvas, invalidate, motion]);

  useFrame((_, delta) => {
    const current = runtime.current;
    if (!current?.points.visible) return;
    const { uniforms, pointer } = current;

    if (current.start === null) {
      current.start = performance.now();
      markReady();
    }

    if (!motion) {
      uniforms.uTime.value = STILL_TIME;
      uniforms.uHover.value = 0;
      return;
    }

    const time = elapsed(current);
    const dt = Math.min(delta, 1 / 30);
    const target = uniforms.uPointer.value;
    const follow = 1 - Math.exp(-dt * POINTER_FOLLOW);
    target.x += (pointer.x - target.x) * follow;
    target.y += (pointer.y - target.y) * follow;
    const hover = pointer.inside ? 1 : 0;
    uniforms.uHover.value +=
      (hover - uniforms.uHover.value) * (1 - Math.exp(-dt * HOVER_FOLLOW));
    uniforms.uTime.value = time;

    const moving =
      time < INTRO_END ||
      uniforms.uRipples.value.some((slot) => time - slot.z < RIPPLE_LIFE) ||
      Math.hypot(pointer.x - target.x, pointer.y - target.y) > 0.3 ||
      Math.abs(hover - uniforms.uHover.value) > 0.002;
    if (moving) invalidate();
  });

  return null;
}
