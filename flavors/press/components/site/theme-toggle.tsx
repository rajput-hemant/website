"use client";

import { swapPlates } from "@/flavors/press/lib/interaction/plate-swap";
import { cn } from "@/flavors/press/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * Flips between the paper proof and the plate view. Its label says what a
 * press does next; the choice is saved and wins over the OS setting. The
 * plate swap sounds with the wipe, not the click (silent on touch, like
 * every UI tap).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "light") === "dark";
  return (
    <button
      type="button"
      aria-pressed={dark}
      data-voice="none"
      onClick={(event) => {
        const { nativeEvent } = event;
        const touch =
          nativeEvent instanceof PointerEvent &&
          nativeEvent.pointerType === "touch";
        swapPlates(dark ? "light" : "dark", { voice: !touch });
      }}
      className={cn(
        "press inline-flex min-h-11 items-center gap-2 px-2 slug text-ink!",
        className
      )}
    >
      <span
        aria-hidden
        className="size-2.5 rounded-full border border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]"
      />
      <span>Plate view</span>
    </button>
  );
}
