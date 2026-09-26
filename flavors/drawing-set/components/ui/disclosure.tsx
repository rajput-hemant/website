"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";
import { ChevronRight } from "lucide-react";

import styles from "./disclosure.module.css";

const instantClass = styles.instant ?? "";

export type DisclosureProps = {
  /** Always-visible summary row; keep it to one line. */
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Anchor id; a URL hash targeting it (or anything inside) opens it. */
  id?: string;
  /**
   * Another id whose hash also opens this disclosure, such as the article it
   * belongs to: `/work#zunta` scrolls to the role and opens its details.
   */
  openOnHash?: string;
  /** The chevron leads the summary, or trails it for list rows. */
  chevron?: "start" | "end";
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
};

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
 * The site's single progressive-disclosure primitive: a native <details>, so
 * content stays in the DOM for find-in-page, SEO, no-JS and print. The only
 * script is the hash check; the browser opens it for find-in-page itself.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  id,
  openOnHash,
  chevron = "start",
  className,
  summaryClassName,
  contentClassName,
}: DisclosureProps) {
  const ref = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    const details = ref.current;
    if (!details) return;

    const openForHash = () => {
      const hash = currentHash();
      if (!hash || details.open) return;
      const target = document.getElementById(hash);
      const inside = target !== null && details.contains(target);
      if (hash !== openOnHash && !inside) return;

      details.classList.add(instantClass);
      details.open = true;
      requestAnimationFrame(() => {
        details.classList.remove(instantClass);
        // The browser could not scroll to a target that was hidden; now it can.
        const summaryEl = details.querySelector(":scope > summary");
        if (inside && target !== details && !summaryEl?.contains(target)) {
          target.scrollIntoView({ block: "start" });
        }
      });
    };

    openForHash();
    return subscribeToHash(openForHash);
  }, [openOnHash]);

  const icon = (
    <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
      <ChevronRight
        strokeWidth={1.75}
        className={cn("size-3.5 text-ink-faint", styles.chevron)}
      />
    </span>
  );

  return (
    <details
      ref={ref}
      id={id}
      open={defaultOpen}
      data-disclosure
      className={cn("group/disclosure", styles.root, className)}
    >
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        {chevron === "start" && icon}
        <span className="min-w-0 flex-1">{summary}</span>
        {chevron === "end" && icon}
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
