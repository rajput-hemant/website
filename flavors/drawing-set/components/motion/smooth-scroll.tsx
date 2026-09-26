"use client";

import "lenis/dist/lenis.css";

import * as React from "react";
import { gsap, ScrollTrigger } from "@/flavors/drawing-set/lib/motion/gsap";
import { scroll, setLenis } from "@/flavors/drawing-set/lib/motion/scroll";
import Lenis from "lenis";

import { usePublicPathname } from "@/lib/public-pathname";
import { useMotionOn } from "@/components/semantic/use-root-data";

/**
 * Lenis on the single GSAP clock, feeding ScrollTrigger. Off when motion is
 * off, where native scroll feeds ScrollTrigger directly. Touch keeps native
 * scrolling (`syncTouch` stays off).
 */
export function SmoothScroll() {
  const motion = useMotionOn();
  const pathname = usePublicPathname();
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    if (!motion) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", (instance) => {
      scroll.y = instance.scroll;
      scroll.velocity = instance.velocity;
      scroll.progress = instance.progress;
      ScrollTrigger.update();
    });
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;
    setLenis(lenis);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [motion]);

  React.useEffect(() => {
    if (motion) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.velocity = window.scrollY - scroll.y;
      scroll.y = window.scrollY;
      scroll.progress = max > 0 ? scroll.y / max : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [motion]);

  React.useEffect(() => {
    lenisRef.current?.resize();
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
