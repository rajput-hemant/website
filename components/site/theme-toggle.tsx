"use client";

import { Moon, Sun } from "lucide-react";

import { setPrefs } from "@/lib/prefs-store";
import { IconButton } from "@/components/ui/icon-button";

/** Flips between light and dark, pinning the choice (it leaves `system`). */
export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setPrefs({ theme: isDark ? "light" : "dark" });
  };

  return (
    <IconButton label="Toggle dark mode" onClick={toggle}>
      <Sun aria-hidden strokeWidth={1.75} className="hidden dark:block" />
      <Moon aria-hidden strokeWidth={1.75} className="dark:hidden" />
    </IconButton>
  );
}
