"use client";

import { ViewTransition, type ReactNode } from "react";

import { useViewTransitionsEnabled } from "./use-view-transitions";
import styles from "./view-transitions.module.css";

const morph = styles.morph ?? "auto";

export type SharedElementProps = {
  /** Identity shared by the element on both pages; build it with `sharedElementName` (shared-element-name.ts). */
  name: string;
  /** Exactly one element. It must be a single box: a block, or an inline-block that never wraps across lines. */
  children: ReactNode;
};

/**
 * Morphs its child into the element with the same `name` on the next page
 * (size and position together), so a list title visibly becomes the page title.
 *
 * Without a partner on the other page it does nothing of its own and simply
 * moves with the page. Off with the motion preference or OS reduced motion.
 */
export function SharedElement({ name, children }: SharedElementProps) {
  const enabled = useViewTransitionsEnabled();

  return (
    <ViewTransition name={name} share={enabled ? morph : "none"} default="none">
      {children}
    </ViewTransition>
  );
}
