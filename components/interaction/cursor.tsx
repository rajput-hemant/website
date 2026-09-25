"use client";

import { useEffect, useRef } from "react";

import { COPIED_EVENT } from "./cursor-events";
import { resolveCursorTarget, type CursorState } from "./cursor-state";
import styles from "./cursor.module.css";

/** Share of the remaining distance covered per 60Hz frame. */
const FOLLOW = 0.25;
const FRAME_MS = 1000 / 60;
/** The loop stops this long after the last pointer move. */
const SETTLE_MS = 200;
/** Share of the pointer-to-centre distance the ring is pulled over a small target. */
const MAGNET_STRENGTH = 0.35;
/** Longest pull, in px: a hint of snapping, never a detached ring. */
const MAGNET_MAX_PX = 6;
const COPIED_MS = 1400;
const RIPPLE_MS = 420;

type Point = { x: number; y: number };

function magnetOffset(pointer: Point, magnet: DOMRect | null): Point {
  if (!magnet) return { x: 0, y: 0 };
  const dx = (magnet.left + magnet.width / 2 - pointer.x) * MAGNET_STRENGTH;
  const dy = (magnet.top + magnet.height / 2 - pointer.y) * MAGNET_STRENGTH;
  const length = Math.hypot(dx, dy);
  const scale = length > MAGNET_MAX_PX ? MAGNET_MAX_PX / length : 1;
  return { x: dx * scale, y: dy * scale };
}

/**
 * A 24px ring that trails the native cursor and morphs over what's beneath it:
 * links grow and fill, text fields shrink it to a dot, copy controls label it,
 * disabled controls dim it. It squashes on press and pulses on click. Small
 * targets pull it a few pixels towards their centre; the targets themselves
 * never move. Decorative only: hidden from assistive tech, never hit-testable.
 */
export function Cursor() {
  const followerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const ripple = rippleRef.current;
    if (!follower || !ring || !label || !ripple) return;

    const root = document.documentElement;
    const pointer: Point = { x: 0, y: 0 };
    const position: Point = { x: 0, y: 0 };
    let hovered: Element | null = null;
    let magnet: Element | null = null;
    let magnetRect: DOMRect | null = null;
    let tracking = false;
    let selecting = false;
    let copiedUntil = 0;
    let copiedTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let lastFrame = 0;
    let lastMove = 0;

    const setState = (state: CursorState) => {
      if (root.dataset.cursorState !== state) root.dataset.cursorState = state;
    };
    const syncState = () => {
      if (selecting) {
        magnet = null;
        magnetRect = null;
        setState("hidden");
        return;
      }
      const resolved = resolveCursorTarget(hovered, window.location.pathname);
      magnet = resolved.magnet;
      magnetRect = magnet?.getBoundingClientRect() ?? null;
      setState(
        resolved.state === "copy" && performance.now() < copiedUntil
          ? "copied"
          : resolved.state
      );
    };
    const render = () => {
      const transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      follower.style.transform = transform;
      label.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    };
    const goal = (): Point => {
      const offset = magnetOffset(pointer, magnetRect);
      return { x: pointer.x + offset.x, y: pointer.y + offset.y };
    };

    const tick = (now: number) => {
      const elapsed = lastFrame ? now - lastFrame : FRAME_MS;
      lastFrame = now;
      const step = 1 - Math.pow(1 - FOLLOW, elapsed / FRAME_MS);
      const target = goal();
      position.x += (target.x - position.x) * step;
      position.y += (target.y - position.y) * step;

      if (now - lastMove > SETTLE_MS) {
        position.x = target.x;
        position.y = target.y;
        render();
        frame = 0;
        lastFrame = 0;
        return;
      }
      render();
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      lastMove = performance.now();
      frame ||= requestAnimationFrame(tick);
    };
    const hide = () => {
      tracking = false;
      ring.removeAttribute("data-pressed");
      setState("hidden");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      const element = event.target instanceof Element ? event.target : null;
      if (!tracking) {
        tracking = true;
        hovered = element;
        syncState();
        // Appear at the pointer rather than gliding in from the last exit point.
        Object.assign(position, goal());
        render();
      } else if (element !== hovered) {
        hovered = element;
        syncState();
      }
      wake();
    };

    const onPointerOut = (event: PointerEvent) => {
      // Moving into an iframe hands events to its document; null means the pointer left the window.
      const next = event.relatedTarget;
      if (next && !(next instanceof HTMLIFrameElement)) return;
      hide();
    };

    const onScroll = () => {
      if (!tracking) return;
      hovered = document.elementFromPoint(pointer.x, pointer.y);
      syncState();
      wake();
    };

    const onSelectionChange = () => {
      const selection = document.getSelection();
      const next = Boolean(selection && !selection.isCollapsed);
      if (next === selecting) return;
      selecting = next;
      if (tracking) syncState();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse")
        ring.toggleAttribute("data-pressed", true);
    };
    const onPointerUp = () => ring.removeAttribute("data-pressed");

    const onClick = (event: MouseEvent) => {
      // `detail` is 0 for clicks synthesised from the keyboard, which have no position.
      if (!tracking || event.detail === 0) return;
      ripple.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      ripple.firstElementChild?.animate(
        [
          { scale: 0.5, opacity: 0.55 },
          { scale: 2.1, opacity: 0 },
        ],
        { duration: RIPPLE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    };

    const onCopied = () => {
      copiedUntil = performance.now() + COPIED_MS;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => tracking && syncState(), COPIED_MS);
      if (tracking) syncState();
    };

    const passive = { passive: true } as const;
    window.addEventListener("pointermove", onPointerMove, passive);
    window.addEventListener("pointerdown", onPointerDown, passive);
    window.addEventListener("pointerup", onPointerUp, passive);
    window.addEventListener("pointercancel", onPointerUp, passive);
    window.addEventListener("click", onClick, { passive: true, capture: true });
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("blur", hide);
    window.addEventListener(COPIED_EVENT, onCopied);
    document.addEventListener("pointerout", onPointerOut, passive);
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(copiedTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("blur", hide);
      window.removeEventListener(COPIED_EVENT, onCopied);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("selectionchange", onSelectionChange);
      delete root.dataset.cursorState;
    };
  }, []);

  return (
    <>
      <div
        ref={followerRef}
        aria-hidden="true"
        data-cursor-layer
        className={styles.cursor}
      >
        <div ref={ringRef} className={styles.ring} />
      </div>
      <div
        ref={rippleRef}
        aria-hidden="true"
        data-cursor-layer
        className={styles.ripple}
      >
        <div />
      </div>
      <div
        ref={labelRef}
        aria-hidden="true"
        data-cursor-layer
        className={styles.label}
      />
    </>
  );
}
