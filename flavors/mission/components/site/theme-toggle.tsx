"use client";

import { chipClass } from "@/flavors/mission/components/ui/button";
import { setPrefs } from "@/flavors/mission/lib/prefs-store";
import { cn } from "@/flavors/mission/lib/utils";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * Paper or Orbit: the half-filled disc and the theme it is in now. The
 * label says where it goes next; the choice is saved and wins over the OS.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useRootData("theme", "light") === "dark";
  return (
    <button
      data-haptic-switch
      type="button"
      aria-label={dark ? "Switch to paper, light" : "Switch to orbit, dark"}
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={cn(chipClass, "gap-2 px-2", className)}
    >
      <i
        aria-hidden
        className="size-3.5 rounded-full border-[1.5px] border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]"
      />
      <span>{dark ? "Orbit" : "Paper"}</span>
    </button>
  );
}
