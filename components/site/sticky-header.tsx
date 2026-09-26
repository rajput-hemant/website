"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { hasReadingProgress, ReadingProgress } from "./reading-progress";
import styles from "./sticky-header.module.css";

const scrollDriven = () =>
  typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");

/** Scroll-driven CSS handles the veil where it can; no listener is needed there. */
function subscribe(onChange: () => void) {
  if (scrollDriven()) return () => {};
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => !scrollDriven() && window.scrollY > 4;

/**
 * The sticky <header>. It stays calm on scroll: as the page moves under it,
 * a veil of the page background (92%, blurred) and a hairline fade in over
 * the first 48px, just enough to keep the nav legible over text. Long pages
 * add a reading-progress line on that hairline.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrolled = React.useSyncExternalStore(
    subscribe,
    isScrolled,
    () => false
  );

  return (
    <header
      data-site-header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent font-sans"
    >
      <span aria-hidden className={styles.veil} />
      {children}
      {hasReadingProgress(pathname) && <ReadingProgress />}
    </header>
  );
}
