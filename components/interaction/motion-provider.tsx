"use client";

import { MotionConfig } from "motion/react";

import { usePrefs } from "@/lib/prefs-store";

/**
 * Binds Motion to the visitor's settings: the OS reduced-motion setting always
 * applies ("user"), and the site's motion switch forces it ("always").
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { motion } = usePrefs();

  return (
    <MotionConfig reducedMotion={motion ? "user" : "always"}>
      {children}
    </MotionConfig>
  );
}
