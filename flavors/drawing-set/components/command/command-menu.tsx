"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { tinykeys } from "tinykeys";

import { OPEN_COMMAND_EVENT } from "./command-events";
import { goKeys } from "./shortcuts";

const CommandDialog = dynamic(
  () => import("./command-dialog").then((mod) => mod.CommandDialog),
  { ssr: false }
);

const TYPING_TARGET =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/** `/` and `g` sequences must not fire while the visitor is typing text. */
function whenNotTyping(handler: (event: KeyboardEvent) => void) {
  return (event: KeyboardEvent) => {
    if (event.isComposing || event.repeat) return;
    if (
      event.target instanceof Element &&
      event.target.closest(TYPING_TARGET)
    ) {
      return;
    }
    handler(event);
  };
}

/**
 * The always-loaded part of ⌘K: keyboard shortcuts and nothing else. The
 * dialog, cmdk and the index load on first use.
 *
 * ⌘K / Ctrl+K toggles (even from a text field), `/` opens, and `g` then a key
 * jumps to a page.
 */
export function CommandMenu() {
  const router = useRouter();
  // `null` until first opened, so nothing past this file loads before then.
  const [open, setOpen] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const show = (event: Event) => {
      event.preventDefault();
      setOpen(true);
    };
    const toggle = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    const go = (event: KeyboardEvent) => {
      event.preventDefault();
      router.push(goKeys[event.key as keyof typeof goKeys]);
    };

    const unbind = tinykeys(
      window,
      {
        "Meta+k": toggle,
        "Control+k": toggle,
        "/": whenNotTyping(show),
        [`g (${Object.keys(goKeys).join("|")})`]: whenNotTyping(go),
      },
      // tinykeys skips events from fields by default; ⌘K must work there,
      // and `whenNotTyping` already guards the rest.
      { ignore: () => false }
    );
    window.addEventListener(OPEN_COMMAND_EVENT, show);
    return () => {
      unbind();
      window.removeEventListener(OPEN_COMMAND_EVENT, show);
    };
  }, [router]);

  return open === null ? null : (
    <CommandDialog open={open} onOpenChange={setOpen} />
  );
}
