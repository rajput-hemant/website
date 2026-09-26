"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { originOf, revealTheme } from "@/lib/interaction/theme-reveal";
import { IconButton } from "@/components/ui/icon-button";

/*
 * Both icons share one cell; the outgoing one blurs and shrinks away while the
 * incoming one sharpens in. Driven by `data-theme` through the `dark:`
 * variant, so the first paint is already right and no state is needed.
 */
const icon =
  "col-start-1 row-start-1 transition-[opacity,scale,filter] ease-enter";
// Transitions take the timing of the state they move into: exits run faster.
const shown = "opacity-100 blur-[0px] scale-100 duration-(--duration-enter)";
const hidden = "opacity-0 blur-[3px] scale-[0.6] duration-(--duration-exit)";
const shownInDark =
  "dark:opacity-100 dark:blur-[0px] dark:scale-100 dark:duration-(--duration-enter)";
const hiddenInDark =
  "dark:opacity-0 dark:blur-[3px] dark:scale-[0.6] dark:duration-(--duration-exit)";

/** Flips between light and dark, pinning the choice (it leaves `system`). */
export function ThemeToggle() {
  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = document.documentElement.dataset.theme === "dark";
    revealTheme(isDark ? "light" : "dark", originOf(event));
  };

  return (
    <IconButton
      label="Toggle dark mode"
      onClick={toggle}
      data-icon-swap
      className="transition-[background-color,color,scale]"
    >
      <Sun
        aria-hidden
        strokeWidth={1.75}
        className={`${icon} ${hidden} ${shownInDark}`}
      />
      <Moon
        aria-hidden
        strokeWidth={1.75}
        className={`${icon} ${shown} ${hiddenInDark}`}
      />
    </IconButton>
  );
}
