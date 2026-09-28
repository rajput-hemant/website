"use client";

import { setPrefs } from "@/flavors/darkroom/lib/prefs-store";
import { cn } from "@/flavors/darkroom/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * Throws the switch between the safelight and the light table. The label
 * names where it takes you; the choice is saved and wins over the OS.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "dark") === "dark";
  return (
    <button
      data-haptic-switch
      type="button"
      data-voice="relay"
      aria-label={
        dark ? "Switch to the light table" : "Switch to the safelight"
      }
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={cn(
        "group/toggle press inline-flex min-h-11 items-center px-1 transition-[scale] duration-(--duration-ui)",
        className
      )}
    >
      <span
        aria-hidden
        className="rounded-[3px] px-2.5 py-1.5 edge text-soft shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-[color,box-shadow] duration-(--duration-ui) fine:group-hover/toggle:text-ink fine:group-hover/toggle:shadow-[inset_0_0_0_1px_var(--color-ink)]"
      >
        {dark ? "Light table" : "Safelight"}
      </span>
    </button>
  );
}
