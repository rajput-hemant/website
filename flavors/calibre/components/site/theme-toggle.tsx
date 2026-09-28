"use client";

import { setPrefs } from "@/flavors/calibre/lib/prefs-store";
import { cn } from "@/flavors/calibre/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * Turns the watch over: the dial by day, the caseback by night. The label
 * names the side it shows next; the choice is saved and wins over the OS.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "dark") === "dark";
  return (
    <button
      data-haptic-switch
      type="button"
      data-voice="detent"
      aria-label={
        dark ? "Show the dial (light theme)" : "Show the caseback (dark theme)"
      }
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={cn(
        "group/toggle press inline-flex min-h-11 items-center px-1 transition-[scale] duration-(--duration-ui)",
        className
      )}
    >
      <span
        aria-hidden
        className="rounded-[3px] px-2.5 py-1.5 spec text-soft shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-[color,box-shadow] duration-(--duration-ui) fine:group-hover/toggle:text-ink fine:group-hover/toggle:shadow-[inset_0_0_0_1px_var(--color-ink)]"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]" />
          {dark ? "Dial" : "Caseback"}
        </span>
      </span>
    </button>
  );
}
