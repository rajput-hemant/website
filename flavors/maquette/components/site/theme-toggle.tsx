"use client";

import { setPrefs } from "@/flavors/maquette/lib/prefs-store";
import { cn } from "@/flavors/maquette/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * The room's lamp: daylight, or the room dark under one spotlight. The
 * label names where it takes you; the choice is saved and wins over the OS.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const night = useRootData("theme", "dark") === "dark";
  return (
    <button
      type="button"
      data-voice="lamp"
      aria-label={
        night ? "Switch to daylight" : "Switch to night, one spotlight"
      }
      onClick={() => setPrefs({ theme: night ? "light" : "dark" })}
      className={cn(
        "group/toggle press inline-flex min-h-11 items-center gap-2 px-2 num text-soft transition-colors duration-(--duration-ui) fine:hover:text-ink",
        className
      )}
    >
      <span
        aria-hidden
        className="size-3 rounded-full border border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]"
      />
      <span aria-hidden className="max-sm:hidden">
        {night ? "Day" : "Night"}
      </span>
    </button>
  );
}
