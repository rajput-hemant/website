"use client";

import { useEffect, useState, ViewTransition } from "react";
import { usePathname } from "next/navigation";

import {
  NAV_BACK,
  NAV_FORWARD,
  navigationDirection,
  type NavigationDirection,
} from "./navigation-direction";
import { useViewTransitionsEnabled } from "./use-view-transitions";
import styles from "./view-transitions.module.css";

const directionClass: Record<NavigationDirection, string> = {
  forward: styles.forward ?? "auto",
  back: styles.back ?? "auto",
  none: styles.crossfade ?? "auto",
};

/**
 * Animates the page between routes: deeper pages slide in from the right,
 * shallower ones from the left, siblings crossfade. Links can force a direction
 * with `transitionTypes={["nav-forward" | "nav-back"]}`.
 *
 * The layout persists across navigations, so this uses `update`, which also
 * fires for in-page transitions (form actions, Suspense reveals). Those must
 * not slide the page, so it animates only while the rendered path differs from
 * the last committed one, which is true only in a navigation's render.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [committedPath, setCommittedPath] = useState(pathname);
  const enabled = useViewTransitionsEnabled();

  useEffect(() => {
    // Runs after the navigation commits; a plain update never starts a view transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommittedPath(pathname);
  }, [pathname]);

  const navigating = committedPath !== pathname;
  const update =
    enabled && navigating
      ? {
          [NAV_FORWARD]: directionClass.forward,
          [NAV_BACK]: directionClass.back,
          default: directionClass[navigationDirection(committedPath, pathname)],
        }
      : "none";

  return (
    <ViewTransition default="none" update={update}>
      {children}
    </ViewTransition>
  );
}
