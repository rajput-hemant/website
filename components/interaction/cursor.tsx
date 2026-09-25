"use client";

import { useEffect, useRef } from "react";

import styles from "./cursor.module.css";

type CursorState = "default" | "link" | "external" | "copy" | "text" | "hidden";

const INTERACTIVE = "a, button, [role=button], input, textarea, select, label";
const TEXT_ENTRY = "textarea, [contenteditable]:not([contenteditable=false])";
const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);
const EXPLICIT_STATES = new Set<CursorState>(["link", "external", "copy"]);

/** Share of the remaining distance covered per 60Hz frame. */
const FOLLOW = 0.25;
const FRAME_MS = 1000 / 60;
/** The loop stops this long after the last pointer move. */
const SETTLE_MS = 200;

function isExternal(anchor: HTMLAnchorElement) {
  return anchor.target === "_blank" || anchor.host !== window.location.host;
}

function isDisabled(element: Element) {
  return (
    element.matches(":disabled") ||
    element.getAttribute("aria-disabled") === "true"
  );
}

function resolveState(target: Element | null): CursorState {
  if (!target) return "default";
  if (target.closest("iframe")) return "hidden";

  const tagged = target.closest<HTMLElement>("[data-cursor]:not(html)");
  const explicit = tagged?.dataset.cursor as CursorState | undefined;
  if (explicit && EXPLICIT_STATES.has(explicit)) return explicit;

  if (target.closest(TEXT_ENTRY)) return "text";
  const control = target.closest(INTERACTIVE);
  if (!control || isDisabled(control)) return "default";
  if (
    control instanceof HTMLInputElement &&
    !NON_TEXT_INPUTS.has(control.type)
  ) {
    return "text";
  }
  if (control instanceof HTMLAnchorElement && isExternal(control)) {
    return "external";
  }
  return "link";
}

/**
 * A 24px ring that trails the native cursor and morphs over interactive elements.
 * Decorative only: hidden from assistive tech and never hit-testable.
 */
export function Cursor() {
  const followerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!follower || !ring || !label) return;

    const root = document.documentElement;
    const target = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    let hovered: Element | null = null;
    let tracking = false;
    let selecting = false;
    let frame = 0;
    let lastFrame = 0;
    let lastMove = 0;

    const setState = (state: CursorState) => {
      if (root.dataset.cursorState !== state) root.dataset.cursorState = state;
    };
    const syncState = () => {
      setState(selecting ? "hidden" : resolveState(hovered));
    };
    const render = () => {
      const transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      follower.style.transform = transform;
      label.style.transform = transform;
    };

    const tick = (now: number) => {
      const elapsed = lastFrame ? now - lastFrame : FRAME_MS;
      lastFrame = now;
      const step = 1 - Math.pow(1 - FOLLOW, elapsed / FRAME_MS);
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

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        tracking = false;
        setState("hidden");
        return;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      lastMove = performance.now();

      if (!tracking) {
        // Appear at the pointer rather than gliding in from the last exit point.
        position.x = target.x;
        position.y = target.y;
        render();
        tracking = true;
        hovered = null;
      }
      const element = event.target instanceof Element ? event.target : null;
      if (element !== hovered) {
        hovered = element;
        syncState();
      }
      frame ||= requestAnimationFrame(tick);
    };

    const onPointerOut = (event: PointerEvent) => {
      // Moving into an iframe hands events to its document; null means the pointer left the window.
      const next = event.relatedTarget;
      if (next && !(next instanceof HTMLIFrameElement)) return;
      tracking = false;
      setState("hidden");
    };

    const onScroll = () => {
      if (!tracking) return;
      hovered = document.elementFromPoint(target.x, target.y);
      syncState();
    };

    const onSelectionChange = () => {
      const selection = document.getSelection();
      const next = Boolean(selection && !selection.isCollapsed);
      if (next === selecting) return;
      selecting = next;
      if (tracking) syncState();
    };

    const onPointerDown = () => ring.toggleAttribute("data-pressed", true);
    const onPointerUp = () => ring.removeAttribute("data-pressed");
    const onBlur = () => {
      tracking = false;
      setState("hidden");
    };

    const passive = { passive: true } as const;
    window.addEventListener("pointermove", onPointerMove, passive);
    window.addEventListener("pointerdown", onPointerDown, passive);
    window.addEventListener("pointerup", onPointerUp, passive);
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerout", onPointerOut, passive);
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("selectionchange", onSelectionChange);
      delete root.dataset.cursorState;
    };
  }, []);

  return (
    <>
      <div ref={followerRef} aria-hidden="true" className={styles.cursor}>
        <div ref={ringRef} className={styles.ring} />
      </div>
      <div ref={labelRef} aria-hidden="true" className={styles.label} />
    </>
  );
}
