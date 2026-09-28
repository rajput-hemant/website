"use client";

import { usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePublicPathname } from "@/lib/public-pathname";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

/** Whether route changes may animate: the motion switch is on, the OS allows motion, and this isn't the Studio. */
export function useViewTransitionsEnabled(): boolean {
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const inStudio = usePublicPathname().startsWith("/studio");
  return motion && !reducedMotion && !inStudio;
}
