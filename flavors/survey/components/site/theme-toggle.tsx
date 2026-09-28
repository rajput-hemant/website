"use client";

import { setPrefs } from "@/flavors/survey/lib/prefs-store";
import { cn } from "@/flavors/survey/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/** Switches between the day sheet and the night chart; Customize also offers "follow the OS". */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "light") === "dark";
  return (
    <button
      type="button"
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={cn(
        "press caps inline-flex min-h-11 items-center gap-2 rounded-md px-2.5 text-ink-soft transition-colors duration-150 fine:hover:text-ink",
        className
      )}
    >
      <svg aria-hidden viewBox="0 0 12 12" className="size-3">
        <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" />
        <path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor" />
      </svg>
      <span className="max-sm:sr-only">
        {dark ? "Day sheet" : "Night chart"}
      </span>
    </button>
  );
}
