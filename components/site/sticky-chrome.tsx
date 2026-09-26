"use client";

import * as React from "react";

import styles from "./sticky-chrome.module.css";

const scrollDriven = () =>
  typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");

/** Scroll-driven CSS owns the veil where it can; no listener needed there. */
function subscribe(onChange: () => void) {
  if (scrollDriven()) return () => {};
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => !scrollDriven() && window.scrollY > 4;

/**
 * The sticky <header> shell: a thin client wrapper so `SiteHeader`'s content
 * (nav, wordmark, triggers) stays a server component. Adds a translucent
 * veil and hairline that fade in after a few pixels of scroll.
 */
export function StickyChrome({ children }: { children: React.ReactNode }) {
  const scrolled = React.useSyncExternalStore(
    subscribe,
    isScrolled,
    () => false
  );

  return (
    <header
      data-site-header
      data-scrolled={scrolled || undefined}
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 h-(--header-height)"
    >
      <span aria-hidden className={styles.veil} />
      {children}
    </header>
  );
}
