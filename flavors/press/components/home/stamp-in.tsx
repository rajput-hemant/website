"use client";

import * as React from "react";
import { pressVoices } from "@/flavors/press/lib/sound/voices";
import { cn } from "@/flavors/press/lib/utils";

import { isSoundOn, playVoice } from "@/lib/sound";

const KEY = "hr.pp.stamped";

/**
 * Stamps the hero's proof stamp once per session: CSS (`.stamp-in` in
 * styles.css) brings it down 250ms after the hero paints, and the stamp
 * voice sounds on the frame it lands. Later views this session show it
 * already stamped.
 */
export function StampIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) !== null;
      sessionStorage.setItem(KEY, "1");
    } catch {
      // Storage refused: stamp every visit rather than never.
    }
    if (seen) {
      for (const animation of el.getAnimations()) animation.finish();
      return;
    }
    const stamp = (event: Event) => {
      if (event.target === el && isSoundOn()) playVoice(pressVoices.stamp);
    };
    // Motion on animates it, motion off fades it; either starts after the delay.
    el.addEventListener("animationstart", stamp);
    el.addEventListener("transitionstart", stamp);
    return () => {
      el.removeEventListener("animationstart", stamp);
      el.removeEventListener("transitionstart", stamp);
    };
  }, []);
  return (
    <div ref={ref} className={cn("stamp-in w-fit max-w-full", className)}>
      {children}
    </div>
  );
}
