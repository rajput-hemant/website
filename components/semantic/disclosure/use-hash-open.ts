"use client";

import * as React from "react";

function currentHash(): string | null {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

type NavigationTarget = Window & { navigation?: EventTarget };

/** Calls `onChange` on every hash change, including Next's same-page pushState ones. */
function subscribeToHash(onChange: () => void) {
  const navigation = (window as NavigationTarget).navigation;
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  navigation?.addEventListener("navigatesuccess", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    navigation?.removeEventListener("navigatesuccess", onChange);
  };
}

/**
 * Opens a native <details> when the URL hash targets it, something inside
 * it, or `openOnHash`, then scrolls to a target the browser could not reach
 * while it was hidden. `instantClass` is on the element for that one frame,
 * so the edition can skip its open animation.
 */
export function useHashOpen(
  ref: React.RefObject<HTMLDetailsElement | null>,
  { openOnHash, instantClass }: { openOnHash?: string; instantClass?: string }
) {
  React.useEffect(() => {
    const details = ref.current;
    if (!details) return;

    const openForHash = () => {
      const hash = currentHash();
      if (!hash || details.open) return;
      const target = document.getElementById(hash);
      const inside = target !== null && details.contains(target);
      if (hash !== openOnHash && !inside) return;

      if (instantClass) details.classList.add(instantClass);
      details.open = true;
      requestAnimationFrame(() => {
        if (instantClass) details.classList.remove(instantClass);
        const summary = details.querySelector(":scope > summary");
        if (inside && target !== details && !summary?.contains(target)) {
          target.scrollIntoView({ block: "start" });
        }
      });
    };

    openForHash();
    return subscribeToHash(openForHash);
  }, [ref, openOnHash, instantClass]);
}
