"use client";

import * as React from "react";
import { animate, cancelFrame, frame, useSpring } from "motion/react";
import { createPortal } from "react-dom";

import {
  parallaxShift,
  spotOffset,
  spotPatternOffset,
  type Offset,
} from "./texture-geometry";
import { isBackgroundClick } from "./texture-rules";

/** The pattern scrolls at this share of the page's speed. */
const PARALLAX = 0.9;
/** A light, quick follow: the spotlight trails the pointer without lagging it. */
const SPRING = { stiffness: 500, damping: 45, mass: 0.5 };
const RIPPLE_RADIUS_PX = 360;
const RIPPLE_SECONDS = 0.5;
/** `--ease-enter` in globals.css. */
const EASE_ENTER = [0.23, 1, 0.32, 1] as const;

function translate({ x, y }: Offset): string {
  return `translate3d(${x}px, ${y}px, 0)`;
}

/** Where the ambient drift animation has moved the pattern right now. */
function readDrift(fill: HTMLElement | null): Offset {
  const transform = fill ? getComputedStyle(fill).transform : "none";
  if (transform === "none") return { x: 0, y: 0 };
  const matrix = new DOMMatrixReadOnly(transform);
  return { x: matrix.m41, y: matrix.m42 };
}

/**
 * The live texture: portals its own layers into <body> (see the "Live mode"
 * notes in globals.css) and marks <html> with `data-texture-live`, which hides
 * the static `body::before` layer. One passive listener per input moves those
 * layers by writing only their `translate`/`transform`, so every frame is a
 * compositor-only move of layers painted once: scroll shifts the pattern (the
 * parallax), the pointer (sprung) moves the spotlight over the lit pattern,
 * and a click on empty background sends a ripple through the pattern.
 *
 * Loaded lazily by InteractionLayer only when `textureIsLive` holds, so the
 * default page never fetches it (or the Motion code it uses).
 */
export function TextureEffects({ spotlight }: { spotlight: boolean }) {
  const patternRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const spotRef = React.useRef<HTMLDivElement>(null);
  const spotPatternRef = React.useRef<HTMLDivElement>(null);
  const x = useSpring(-1000, SPRING);
  const y = useSpring(-1000, SPRING);

  // A layout effect, so the static layer is hidden in the same frame the live
  // layers first paint: never both at once, never neither.
  React.useLayoutEffect(() => {
    const pattern = patternRef.current;
    if (!pattern) return;
    const spot = spotRef.current;
    const spotPattern = spotPatternRef.current;
    const root = document.documentElement;
    root.dataset.textureLive = "";

    // The pattern overhangs the viewport by one tile (`top: -tile`).
    const readTile = () =>
      Math.abs(Number.parseFloat(getComputedStyle(pattern).top)) || 0;
    let tile = readTile();
    let shift = 0;
    let lit = false;

    const writeSpot = () => {
      if (!spot || !spotPattern) return;
      spot.style.transform = translate(spotOffset(x.get(), y.get()));
      spotPattern.style.transform = translate(
        spotPatternOffset(x.get(), y.get(), shift)
      );
    };

    const writeShift = () => {
      shift = parallaxShift(window.scrollY, tile, PARALLAX);
      pattern.style.translate = `0 ${shift}px`;
      writeSpot();
    };
    writeShift();

    const onScroll = () => frame.render(writeShift);
    // The Customize picker previews other textures on these same layers.
    const textureObserver = new MutationObserver(() => {
      tile = readTile();
      writeShift();
    });
    textureObserver.observe(root, { attributeFilter: ["data-texture"] });
    // Both springs settle in Motion's update step; one write per frame follows.
    const onSpring = () => frame.render(writeSpot);
    const offX = x.on("change", onSpring);
    const offY = y.on("change", onSpring);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !spot) return;
      if (!lit) {
        // Appear where the pointer is instead of springing in from off-screen.
        x.jump(event.clientX);
        y.jump(event.clientY);
        lit = true;
        spot.style.opacity = "1";
        return;
      }
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget !== null || !lit || !spot) return;
      lit = false;
      spot.style.opacity = "";
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || !isBackgroundClick(event.target)) return;
      if (!window.getSelection()?.isCollapsed) return;

      const ripple = document.createElement("div");
      ripple.className = "texture-ripple";
      ripple.setAttribute("aria-hidden", "true");
      // The ripple box overhangs the viewport by a tile and starts where the
      // parallax and the ambient drift have the pattern now, so its ring
      // lines up with it (the drift moves under a pixel in the ring's 500ms).
      const drift = readDrift(fillRef.current);
      const dy = shift + drift.y;
      ripple.style.translate = `${drift.x}px ${dy}px`;
      ripple.style.setProperty("--rx", `${event.clientX + tile - drift.x}px`);
      ripple.style.setProperty("--ry", `${event.clientY + tile - dy}px`);
      document.body.append(ripple);

      const opacity = Number(getComputedStyle(ripple).opacity) || 1;
      void animate(
        ripple,
        { "--ripple": ["0px", `${RIPPLE_RADIUS_PX}px`], opacity: [opacity, 0] },
        { duration: RIPPLE_SECONDS, ease: EASE_ENTER }
      ).then(() => ripple.remove());
    };

    const passive = { passive: true } as const;
    window.addEventListener("scroll", onScroll, passive);
    document.addEventListener("click", onClick, passive);
    if (spot) {
      document.addEventListener("pointermove", onPointerMove, passive);
      document.addEventListener("pointerout", onPointerOut, passive);
    }

    return () => {
      cancelFrame(writeShift);
      cancelFrame(writeSpot);
      textureObserver.disconnect();
      offX();
      offY();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      for (const ripple of document.querySelectorAll(".texture-ripple")) {
        ripple.remove();
      }
      delete root.dataset.textureLive;
    };
  }, [x, y]);

  return createPortal(
    <div className="texture-layer" aria-hidden="true">
      <div className="texture-base">
        <div ref={patternRef} className="texture-pattern">
          <div ref={fillRef} className="texture-fill" />
        </div>
      </div>
      {spotlight && (
        <div ref={spotRef} className="texture-spot">
          <div ref={spotPatternRef} className="texture-spot-pattern">
            <div className="texture-fill" />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
