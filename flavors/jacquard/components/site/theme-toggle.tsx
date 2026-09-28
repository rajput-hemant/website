"use client";

import { chipClass } from "@/flavors/jacquard/components/ui/button";
import { setPrefs } from "@/flavors/jacquard/lib/prefs-store";
import { cn } from "@/flavors/jacquard/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * Day loom or night loom. The label names where it goes next; the choice is
 * saved and wins over the OS setting.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "light") === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to the day loom" : "Switch to the night loom"}
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={cn(chipClass, className)}
    >
      <span className="chip-box">{dark ? "Day loom" : "Night loom"}</span>
    </button>
  );
}
