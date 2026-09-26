"use client";

import * as React from "react";
import type { Route } from "next";
import { tinykeys } from "tinykeys";

import { OPEN_COMMAND_EVENT } from "@/lib/command/events";

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
 * The ⌘K keyboard contract: ⌘K / Ctrl+K toggles (even from a text field),
 * `/` and the open-command event open, and `g` then a key from `keys` jumps
 * to that page. The edition owns the key map and what opening means.
 */
export function useCommandShortcuts({
  keys,
  onOpen,
  onToggle,
  navigate,
}: {
  keys: Readonly<Record<string, Route>>;
  onOpen: () => void;
  onToggle: () => void;
  navigate: (href: Route) => void;
}): void {
  const latest = React.useRef({ onOpen, onToggle, navigate });
  React.useEffect(() => {
    latest.current = { onOpen, onToggle, navigate };
  });

  React.useEffect(() => {
    const show = (event: Event) => {
      event.preventDefault();
      latest.current.onOpen();
    };
    const toggle = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      event.preventDefault();
      latest.current.onToggle();
    };
    const go = (event: KeyboardEvent) => {
      const href = keys[event.key];
      if (!href) return;
      event.preventDefault();
      latest.current.navigate(href);
    };

    const unbind = tinykeys(
      window,
      {
        "Meta+k": toggle,
        "Control+k": toggle,
        "/": whenNotTyping(show),
        [`g (${Object.keys(keys).join("|")})`]: whenNotTyping(go),
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
    // `keys` is each edition's module constant, so this binds once.
  }, [keys]);
}
