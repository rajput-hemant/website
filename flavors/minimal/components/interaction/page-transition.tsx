"use client";

import * as React from "react";
import { usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePublicPathname } from "@/lib/public-pathname";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

import {
  NAV_BACK,
  NAV_FORWARD,
  navigationDirection,
  type NavigationDirection,
} from "./navigation-direction";
import styles from "./view-transitions.module.css";

const directionClass: Record<NavigationDirection, string> = {
  forward: styles.forward ?? "auto",
  back: styles.back ?? "auto",
  none: styles.crossfade ?? "auto",
};

const fadeClass = styles.fade ?? "auto";

/**
 * Animates the page between routes: a blur crossfade between siblings, with
 * an 8px depth shift into a detail page and back out. Links can force a
 * direction with `transitionTypes={["nav-forward" | "nav-back"]}`. Under
 * reduced motion it is a plain crossfade; with the motion switch off, nothing.
 *
 * The layout persists across navigations, so this uses `update`, which also
 * fires for in-page transitions (form actions, Suspense reveals). Those must
 * not animate the page, so it animates only while the rendered path differs
 * from the last committed one, which is true only in a navigation's render.
 *
 * The first navigation also marks <html> with `data-navigated`, which retires
 * the first-paint `.stagger` entrance (globals.css): after that, arriving
 * content is carried by this transition instead of cascading a second time.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePublicPathname();
  const [committedPath, setCommittedPath] = React.useState(pathname);
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = motion && !pathname.startsWith("/studio");

  React.useEffect(() => {
    // Runs after the navigation commits; a plain update never starts a view transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommittedPath(pathname);
  }, [pathname]);

  const navigating = committedPath !== pathname;

  // Layout effect: it must land before the new page's first frame is painted
  // or captured, or its stagger would start and then snap to the end.
  React.useLayoutEffect(() => {
    if (navigating) document.documentElement.dataset.navigated = "";
  }, [navigating]);

  const update =
    enabled && navigating
      ? reducedMotion
        ? fadeClass
        : {
            [NAV_FORWARD]: directionClass.forward,
            [NAV_BACK]: directionClass.back,
            default:
              directionClass[navigationDirection(committedPath, pathname)],
          }
      : "none";

  return (
    <React.ViewTransition default="none" update={update}>
      {children}
    </React.ViewTransition>
  );
}
