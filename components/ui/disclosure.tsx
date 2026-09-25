"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import styles from "./disclosure.module.css";

const instantClass = styles.instant ?? "";

export type DisclosureProps = {
  /** Always-visible summary row; keep it to one line. */
  summary: ReactNode;
  children: ReactNode;
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
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
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
    <span aria-hidden className="flex h-lh shrink-0 items-center">
      <ChevronRight
        strokeWidth={1.75}
        className={cn("size-3.5 text-subtle", styles.chevron)}
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
          "flex cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden",
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

const visibleDisclosures = (scope: HTMLElement) =>
  Array.from(
    scope.querySelectorAll<HTMLDetailsElement>("details[data-disclosure]")
  ).filter((details) => details.closest("[hidden]") === null);

export type ExpandAllProps = {
  /** Id of the element whose disclosures this opens and closes. */
  controls: string;
  className?: string;
};

/**
 * Opens or closes every disclosure inside `controls` at once. Its label
 * follows the disclosures, so opening the last one by hand flips it to
 * "Collapse all". Filtered-out (hidden) rows are left alone.
 */
export function ExpandAll({ controls, className }: ExpandAllProps) {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const scope = document.getElementById(controls);
    if (!scope) return;
    const sync = () => {
      const items = visibleDisclosures(scope);
      setAllOpen(items.length > 0 && items.every((details) => details.open));
    };
    sync();
    // toggle doesn't bubble, but a capturing listener on an ancestor still hears it.
    scope.addEventListener("toggle", sync, true);
    const observer = new MutationObserver(sync);
    observer.observe(scope, { attributeFilter: ["hidden"], subtree: true });
    return () => {
      scope.removeEventListener("toggle", sync, true);
      observer.disconnect();
    };
  }, [controls]);

  function toggleAll() {
    const scope = document.getElementById(controls);
    if (!scope) return;
    const next = !allOpen;
    for (const details of visibleDisclosures(scope)) details.open = next;
    setAllOpen(next);
  }

  const Icon = allOpen ? ChevronsDownUp : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={toggleAll}
      aria-controls={controls}
      data-print-hide
      className={cn(
        "hit-area -mx-1.5 -my-1 inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 meta whitespace-nowrap text-subtle transition-colors duration-(--duration-exit) hover:text-foreground focus-visible:outline-offset-0",
        className
      )}
    >
      <Icon aria-hidden strokeWidth={1.75} className="size-3" />
      {allOpen ? "Collapse all" : "Expand all"}
    </button>
  );
}
