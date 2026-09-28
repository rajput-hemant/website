"use client";

import * as React from "react";

import "lenis/dist/lenis.css";

import { type LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";

/** Longest step fed to Lenis, so a frame after a stall or an idle period never jumps. */
const MAX_STEP_MS = 50;
/** Frames without a smooth scroll in flight before the loop parks itself. */
const IDLE_FRAMES = 10;

/**
 * How far above an anchor target to stop so it lands under the sticky header.
 * Lenis already subtracts the root's `scroll-padding-top`, so only the part of
 * `--header-h` that padding doesn't cover is added here.
 */
function readAnchorOffset(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;height:var(--header-h,0px)";
  document.body.append(probe);
  const header = probe.getBoundingClientRect().height;
  probe.remove();

  const padding =
    Number.parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop
    ) || 0;
  return -Math.max(0, header - padding);
}

function preventSmoothing(node: HTMLElement) {
  return node.matches("[data-lenis-prevent], [role=dialog], [role=listbox]");
}

/** Drives Lenis from one rAF loop that sleeps while idle and while the tab is hidden. */
function LenisTicker() {
  const lenis = useLenis();

  React.useEffect(() => {
    if (!lenis) return;

    let frame = 0;
    let lastFrame = 0;
    let clock = 0;
    let idleFrames = 0;

    const tick = (now: number) => {
      clock += lastFrame ? Math.min(now - lastFrame, MAX_STEP_MS) : 0;
      lastFrame = now;
      lenis.raf(clock);

      idleFrames = lenis.isScrolling === "smooth" ? 0 : idleFrames + 1;
      if (idleFrames > IDLE_FRAMES) {
        frame = 0;
        lastFrame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      idleFrames = 0;
      if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const sleep = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    };
    const onVisibilityChange = () => (document.hidden ? sleep() : wake());

    const offVirtualScroll = lenis.on("virtual-scroll", wake);
    // Anchor links and programmatic scrolls start from clicks, not wheel input.
    window.addEventListener("click", wake, { capture: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    wake();

    return () => {
      sleep();
      offVirtualScroll();
      window.removeEventListener("click", wake, { capture: true });
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [lenis]);

  return null;
}

/**
 * Smoothed wheel scrolling on top of native scroll: keyboard, touch, find-in-page
 * and `:target` stay native. Unmounting destroys Lenis and restores native scroll.
 */
export function SmoothScroll() {
  const [anchorOffset, setAnchorOffset] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Measured once on mount: it needs layout, which render must not read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnchorOffset(readAnchorOffset());
  }, []);

  if (anchorOffset === null) return null;

  const options: LenisOptions = {
    lerp: 0.12,
    wheelMultiplier: 1,
    syncTouch: false,
    autoRaf: false,
    anchors: { offset: anchorOffset },
    // Clicking an internal link mid-glide ends the glide. Otherwise Lenis keeps
    // easing towards its old target after Next resets the scroll, and the new
    // page opens partway down instead of at the top.
    stopInertiaOnNavigate: true,
    prevent: preventSmoothing,
  };

  return (
    <ReactLenis root options={options}>
      <LenisTicker />
    </ReactLenis>
  );
}
