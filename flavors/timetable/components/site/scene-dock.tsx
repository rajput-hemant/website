"use client";

import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

/**
 * Where a docking indicator hangs while its section is read: an empty,
 * sticky box in the section's own column. Only drawn at `lg`, where the
 * column exists; below it the indicator stays in the page header.
 */
export function SceneDockTarget({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-scene-dock
      className={cn(
        "sticky top-[calc(var(--header-height)+1.5rem)] aspect-[16/10] w-full max-lg:hidden",
        className
      )}
    />
  );
}

const headerHeight = () =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--header-height"
    )
  ) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 0;

/**
 * Holds a slot's poster and scene host. Once the slot has scrolled under
 * the sign band and the page's `[data-scene-dock]` box is on screen, the
 * contents move there (fixed to its box, so the scene follows the reader),
 * and they return when the slot comes back. The slot keeps its own box, so
 * nothing in the flow shifts.
 */
export function SceneDock({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const slot = el?.parentElement;
    const target = document.querySelector<HTMLElement>("[data-scene-dock]");
    if (!el || !slot || !target) return;
    let top = headerHeight();
    let queued = 0;
    const place = () => {
      queued = 0;
      const home = slot.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const docked =
        box.width > 0 &&
        home.bottom < top &&
        box.bottom > top &&
        box.top < innerHeight;
      if (!docked) {
        if (el.dataset.docked === undefined) return;
        delete el.dataset.docked;
        el.style.cssText = "";
        return;
      }
      el.dataset.docked = "";
      el.style.cssText = `position:fixed;top:${box.top}px;left:${box.left}px;width:${box.width}px;height:${box.height}px`;
    };
    const queue = () => {
      queued ||= requestAnimationFrame(place);
    };
    const resize = () => {
      top = headerHeight();
      queue();
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", resize);
    place();
    return () => {
      cancelAnimationFrame(queued);
      removeEventListener("scroll", queue);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 data-docked:animate-[fade_200ms_var(--ease-enter)]"
    >
      {children}
    </div>
  );
}
