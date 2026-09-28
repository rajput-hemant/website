import { gsap } from "gsap";

import { input, sceneStore } from "./store";

type Render = (seconds: number) => void;

const POINTER_AWAKE_MS = 1200;

let render: Render | null = null;
let tweens = 0;
let frames = 0;
let settling = false;
let lastY = Number.NaN;
let asleepSince = 0;
const after: (() => void)[] = [];

export const motionOn = () => document.documentElement.dataset.motion === "on";

/** Requests at least `n` more frames. */
export function kick(n = 1) {
  frames = Math.max(frames, n);
}

/** The frame loop reports whether damped values are still converging. */
export function settle(moving: boolean) {
  settling = moving;
}

export function afterNextFrame(callback: () => void) {
  after.push(callback);
  kick();
}

function awake(now: number) {
  const y = window.scrollY;
  const scrolled = y !== lastY;
  lastY = y;
  const { live, visible } = sceneStore.getState();
  if (!render || !live || !visible) return false;
  return (
    tweens > 0 ||
    frames > 0 ||
    settling ||
    scrolled ||
    now - input.movedAt < POINTER_AWAKE_MS
  );
}

function tick() {
  const now = performance.now();
  if (!awake(now)) {
    asleepSince ||= now;
    return;
  }
  if (asleepSince && now - asleepSince > 300) {
    sceneStore.setState((s) => ({ wake: s.wake + 1 }));
  }
  asleepSince = 0;
  if (frames > 0) frames--;
  renderNow(now);
}

let scene = 0;
let lastNow = 0;

/**
 * Renders one frame now, e.g. right after attaching the canvas. Scene time
 * steps at most 1/30s per frame, so waking from sleep never jumps.
 */
export function renderNow(now = performance.now()) {
  scene += Math.min((now - lastNow) / 1000, 1 / 30);
  lastNow = now;
  render?.(scene);
  for (const callback of after.splice(0)) callback();
}

export function startClock(fn: Render) {
  render = fn;
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    render = null;
  };
}

/** A GSAP tween that keeps the clock awake while it runs. Instant with motion off. */
export function tween(target: object, vars: gsap.TweenVars) {
  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    tweens--;
  };
  tweens++;
  kick();
  return gsap.to(target, {
    duration: 1.1,
    ease: "expo.out",
    overwrite: "auto",
    ...vars,
    ...(motionOn() ? {} : { duration: 0 }),
    onComplete: end,
    onInterrupt: end,
  });
}
