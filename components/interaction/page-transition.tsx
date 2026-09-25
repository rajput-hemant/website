"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { usePrefs } from "@/lib/prefs-store";

import styles from "./page-transition.module.css";

/** Crossfades route changes (Next navigations are transitions). Off with motion or in the Studio. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const inStudio = usePathname().startsWith("/studio");
  const animate = motion && !reducedMotion && !inStudio;

  return (
    <ViewTransition default={animate ? styles.crossfade : "none"}>
      {children}
    </ViewTransition>
  );
}
