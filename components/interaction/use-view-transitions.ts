"use client";

import { usePathname } from "next/navigation";

import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { usePrefs } from "@/lib/prefs-store";

/** Whether route changes may animate: the motion switch is on, the OS allows motion, and this isn't the Studio. */
export function useViewTransitionsEnabled(): boolean {
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const inStudio = usePathname().startsWith("/studio");
  return motion && !reducedMotion && !inStudio;
}
