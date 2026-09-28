"use client";

import * as React from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * Renders the custom cursor on `document.body` so `position: fixed` always
 * tracks the viewport. A tilt or magnetic transform on a card must not sit on
 * an ancestor of the follower layer.
 */
export function CursorPortal({ children }: { children: React.ReactNode }) {
  const mounted = React.useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}
