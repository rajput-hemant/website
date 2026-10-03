"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { setCommandMenuOpen } from "@/lib/command/state";
import { useCommandShortcuts } from "@/components/semantic/command/use-command-shortcuts";

export function useCommandMenu(
  keys: Readonly<Record<string, string>>,
  options?: { onWillOpen?: () => void }
): {
  open: boolean | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean | null>>;
  /** True when the menu was opened from the keyboard (⌘K, /, etc.). */
  instant: boolean;
} {
  const router = useRouter();
  const [open, setOpen] = React.useState<boolean | null>(null);
  const [instant, setInstant] = React.useState(true);
  const onWillOpen = React.useRef(options?.onWillOpen);
  React.useEffect(() => {
    onWillOpen.current = options?.onWillOpen;
  });

  const openMenu = () => {
    onWillOpen.current?.();
    setInstant(true);
    setOpen(true);
  };
  const toggleMenu = () => {
    setInstant(true);
    setOpen((current) => {
      if (!current) onWillOpen.current?.();
      return !current;
    });
  };

  // Trigger buttons elsewhere read this for aria-expanded and to toggle once.
  React.useEffect(() => setCommandMenuOpen(open === true), [open]);
  React.useEffect(() => () => setCommandMenuOpen(false), []);

  useCommandShortcuts({
    keys,
    onOpen: openMenu,
    onToggle: toggleMenu,
    navigate: (href) => router.push(href),
  });

  return { open, setOpen, instant };
}
