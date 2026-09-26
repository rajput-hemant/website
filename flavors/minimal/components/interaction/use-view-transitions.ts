"use client";

import { usePrefersReducedMotion } from "@/flavors/minimal/lib/hooks/use-media-query";
import { usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePublicPathname } from "@/lib/public-pathname";

/** Whether route changes may animate: the motion switch is on, the OS allows motion, and this isn't the Studio. */
export function useViewTransitionsEnabled(): boolean {
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const inStudio = usePublicPathname().startsWith("/studio");
  return motion && !reducedMotion && !inStudio;
}
