"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 4;

/** The sticky <header>; gains its hairline and backdrop once the page scrolls. */
export function StickyHeader({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);

  return (
    <header
      data-site-header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent font-sans transition-[background-color,border-color] duration-300 data-scrolled:border-border data-scrolled:bg-background/90 data-scrolled:backdrop-blur-lg data-scrolled:backdrop-saturate-150"
    >
      {children}
    </header>
  );
}
