import type { Vector4 } from "three";

import { RIPPLE_LIFETIME } from "./shaders";

const SETTLE_SECONDS = 3.2;
const POINTER_FOLLOW = 14;
/* Slightly underdamped, so the letters overshoot a touch when the pointer leaves. */
const SPRING_STIFFNESS = 90;
const SPRING_DAMPING = 11;
const RIPPLE_SPACING = 0.06;
const RIPPLE_INTERVAL = 0.08;
const REST = 1e-3;

/** CPU-side state for the few values that need integrating; everything per-particle happens on the GPU. */
export type FieldState = {
  time: number;
  progress: number;
  pointerX: number;
  pointerY: number;
  targetX: number;
  targetY: number;
  strength: number;
  strengthVelocity: number;
  strengthTarget: number;
  lastRippleX: number;
  lastRippleY: number;
  lastRippleTime: number;
  nextRipple: number;
  moving: boolean;
};

export function createField(): FieldState {
  return {
    time: 0,
    progress: 0,
    pointerX: 10,
    pointerY: 10,
    targetX: 10,
    targetY: 10,
    strength: 0,
    strengthVelocity: 0,
    strengthTarget: 0,
    lastRippleX: 10,
    lastRippleY: 10,
    lastRippleTime: -Infinity,
    nextRipple: 0,
    moving: false,
  };
}

/** Advances the field by `dt` seconds and reports whether anything is still in motion. */
export function stepField(field: FieldState, dt: number): boolean {
  field.time += dt;
  field.progress = Math.min(1, field.progress + dt / SETTLE_SECONDS);

  const follow = 1 - Math.exp(-dt * POINTER_FOLLOW);
  field.pointerX += (field.targetX - field.pointerX) * follow;
  field.pointerY += (field.targetY - field.pointerY) * follow;

  const acceleration =
    SPRING_STIFFNESS * (field.strengthTarget - field.strength) -
    SPRING_DAMPING * field.strengthVelocity;
  field.strengthVelocity += acceleration * dt;
  field.strength += field.strengthVelocity * dt;

  const springing =
    Math.abs(field.strengthTarget - field.strength) > REST ||
    Math.abs(field.strengthVelocity) > REST;
  const following =
    field.strength > REST &&
    Math.hypot(field.targetX - field.pointerX, field.targetY - field.pointerY) >
      REST * 0.1;
  const rippling = field.time - field.lastRippleTime < RIPPLE_LIFETIME;

  return field.progress < 1 || springing || following || rippling;
}

/** Moves the pointer target; the first contact snaps so the lens doesn't sweep in from the last exit point. */
export function movePointer(field: FieldState, x: number, y: number) {
  if (field.strengthTarget === 0 && field.strength < REST) {
    field.pointerX = x;
    field.pointerY = y;
  }
  field.targetX = x;
  field.targetY = y;
  field.strengthTarget = 1;
}

export function releasePointer(field: FieldState) {
  field.strengthTarget = 0;
}

/** Emits a ripple at the pointer when it has travelled far enough, or always when `force` is set. */
export function maybeRipple(
  field: FieldState,
  ripples: Vector4[],
  amplitude: number,
  force = false
) {
  const travelled = Math.hypot(
    field.targetX - field.lastRippleX,
    field.targetY - field.lastRippleY
  );
  const elapsed = field.time - field.lastRippleTime;
  if (!force && (travelled < RIPPLE_SPACING || elapsed < RIPPLE_INTERVAL))
    return;

  ripples[field.nextRipple]?.set(
    field.targetX,
    field.targetY,
    field.time,
    amplitude
  );
  field.nextRipple = (field.nextRipple + 1) % ripples.length;
  field.lastRippleX = field.targetX;
  field.lastRippleY = field.targetY;
  field.lastRippleTime = field.time;
}
