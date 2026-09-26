"use client";

import * as React from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 4;

/**
 * The sticky <header>. It stays calm on scroll: once the page moves under it,
 * it gains a translucent hairline and a light veil of the page background,
 * just enough to keep the nav legible over text.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const scrolled = React.useSyncExternalStore(
    subscribe,
    isScrolled,
    () => false
  );

  return (
    <header
      data-site-header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent font-sans transition-[background-color,border-color] duration-(--duration-enter) ease-enter data-scrolled:border-hairline data-scrolled:bg-background/85 data-scrolled:backdrop-blur-sm"
    >
      {children}
    </header>
  );
}
