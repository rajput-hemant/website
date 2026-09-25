"use client";

import { useEffect } from "react";
import {
  animate,
  cancelFrame,
  frame,
  useMotionValueEvent,
  useSpring,
} from "motion/react";

import { isBackgroundClick } from "./texture-rules";

/** The pattern scrolls at this share of the page's speed. */
const PARALLAX = 0.9;
/** A light, quick follow: the spotlight trails the pointer without lagging it. */
const SPRING = { stiffness: 500, damping: 45, mass: 0.5 };
const RIPPLE_RADIUS_PX = 360;
const RIPPLE_SECONDS = 0.5;
/** `--ease-enter` in globals.css. */
const EASE_ENTER = [0.23, 1, 0.32, 1] as const;

function setBodyVar(name: string, value: string) {
  document.body.style.setProperty(name, value);
}

/** How far the texture layers overhang the viewport: one pattern tile. */
function readTile(): number {
  const top = getComputedStyle(document.body, "::before").top;
  return Math.abs(Number.parseFloat(top)) || 0;
}

/**
 * The live texture: marks <html> with `data-texture-live` (globals.css then
 * adds the spotlight layer, the parallax overhang and the grain drift) and
 * drives it from one passive listener per input. Per frame it only writes
 * non-inherited custom properties on <body>, so nothing else restyles and
 * nothing lays out: the pointer (--tx/--ty, sprung) moves the spotlight's
 * mask, scroll (--tshift) translates the layers, and a click on empty
 * background sends a ripple through the pattern.
 *
 * Loaded lazily by InteractionLayer only when `textureIsLive` holds, so the
 * default page never fetches it (or the Motion code it uses).
 */
export function TextureEffects({ spotlight }: { spotlight: boolean }) {
  const x = useSpring(-1000, SPRING);
  const y = useSpring(-1000, SPRING);

  useMotionValueEvent(x, "change", (value) => setBodyVar("--tx", `${value}px`));
  useMotionValueEvent(y, "change", (value) => setBodyVar("--ty", `${value}px`));

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textureLive = "";
    const tile = readTile();
    let shift = 0;
    let lit = false;

    const writeShift = () => {
      shift = tile > 0 ? -((window.scrollY * PARALLAX) % tile) : 0;
      setBodyVar("--tshift", `${shift}px`);
    };
    writeShift();

    const onScroll = () => frame.render(writeShift);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!lit) {
        // Appear where the pointer is instead of springing in from off-screen.
        x.jump(event.clientX);
        y.jump(event.clientY);
        lit = true;
        setBodyVar("--tlit", "1");
        return;
      }
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget !== null || !lit) return;
      lit = false;
      setBodyVar("--tlit", "0");
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || !isBackgroundClick(event.target)) return;
      if (!window.getSelection()?.isCollapsed) return;

      const ripple = document.createElement("div");
      ripple.className = "texture-ripple";
      ripple.setAttribute("aria-hidden", "true");
      // The ripple box overhangs the viewport by a tile and rides the parallax.
      ripple.style.setProperty("--rx", `${event.clientX + tile}px`);
      ripple.style.setProperty("--ry", `${event.clientY + tile - shift}px`);
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
    if (spotlight) {
      document.addEventListener("pointermove", onPointerMove, passive);
      document.addEventListener("pointerout", onPointerOut, passive);
    }

    return () => {
      cancelFrame(writeShift);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      for (const ripple of document.querySelectorAll(".texture-ripple")) {
        ripple.remove();
      }
      for (const name of ["--tx", "--ty", "--tshift", "--tlit"]) {
        document.body.style.removeProperty(name);
      }
      delete root.dataset.textureLive;
    };
  }, [spotlight, x, y]);

  return null;
}
