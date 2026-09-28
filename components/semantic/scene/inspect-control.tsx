"use client";

import * as React from "react";

import {
  inspectFor,
  inspectUsed,
  watchInspect,
  type Inspect,
} from "@/lib/scene/inspect";
import { useCoarsePointer } from "@/components/semantic/use-media-query";

/**
 * The DOM side of the inspect controls (docs/m2-scene-spec.md, "Inspect
 * controls"): headless, styled by the edition through `className`. Both
 * render nothing until the scene's `bindInspect` has registered `target`
 * (the slot host or glyph host), so nothing is focusable without a live
 * model. Mount them as siblings of the host, never inside it.
 */

export const INSPECT_LABEL =
  "Rotate model: use arrow keys, plus and minus to zoom, 0 to reset";

const HINT_KEY = "hr.inspect.hint";

/** The inspect bound to `target`, or null while its scene isn't live. */
export function useInspect(
  target: React.RefObject<HTMLElement | null>
): Inspect | null {
  return React.useSyncExternalStore(
    watchInspect,
    () => inspectFor(target.current),
    () => null
  );
}

/**
 * The keyboard twin: a focusable button (the canvas stays aria-hidden).
 * Arrows turn, shift for bigger steps, + and - zoom, 0 or Home resets, and
 * activating it (Enter, Space or a click) resets too.
 */
export function InspectControl({
  target,
  className,
  label = INSPECT_LABEL,
  children,
}: {
  target: React.RefObject<HTMLElement | null>;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const inspect = useInspect(target);
  if (!inspect) return null;
  return (
    <button
      type="button"
      aria-label={label}
      data-inspect-control
      className={className}
      onClick={() => inspect.reset()}
      onKeyDown={(e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (inspect.key(e.key, e.shiftKey)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

function seenBefore() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    // Storage blocked: the hint just shows again next visit.
  }
}

/**
 * "drag to rotate · pinch to zoom" (on a mouse, ctrl/cmd + scroll), shown
 * while `target`'s model is live until the first time any inspect on the
 * page is used, then never again for this viewer. Decorative, so
 * aria-hidden: the control's label carries the same instructions.
 */
export function InspectHint({
  target,
  className,
  text,
}: {
  target: React.RefObject<HTMLElement | null>;
  className?: string;
  text?: string;
}) {
  const inspect = useInspect(target);
  const used = React.useSyncExternalStore(
    watchInspect,
    () => inspectUsed() || seenBefore(),
    () => true
  );
  const coarse = useCoarsePointer();
  React.useEffect(() => {
    if (inspect && inspectUsed()) markSeen();
  }, [inspect, used]);
  if (!inspect || used) return null;
  const words =
    text ??
    (coarse
      ? "drag to rotate · pinch to zoom"
      : "drag to rotate · ctrl + scroll to zoom");
  return (
    <p aria-hidden data-inspect-hint className={className}>
      {words}
    </p>
  );
}
