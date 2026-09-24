'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className="quiet-link inline-flex size-6 cursor-pointer items-center justify-center rounded-sm"
    >
      <span className="contents dark:hidden">
        <Moon size={16} />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="hidden dark:contents">
        <Sun size={16} />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}
