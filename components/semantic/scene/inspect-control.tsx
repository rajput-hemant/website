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
 * The DOM side of the inspect controls (docs/guides/m2-scene-spec.md, "Inspect
 * controls"): headless, styled by the edition through `className`. Both
 * render nothing until the scene's `bindInspect` has registered `target`
 * (the slot host or glyph host), so nothing is focusable without a live
 * model. Mount them as siblings of the host, never inside it.
 */

export const INSPECT_LABEL = "Rotate and zoom the model";

const HINT_KEY = "inspect.hint";

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

/** The live region speaks at most this often while keys are held. */
const ANNOUNCE_MS = 600;

const norm = (deg: number) => ((Math.round(deg) % 360) + 360) % 360;

/**
 * The keyboard twin: a small group of real buttons (the canvas stays
 * aria-hidden), so a screen reader in browse mode can reach each action.
 * Arrows turn, shift for bigger steps, + and - zoom, 0 or Home resets, from
 * any button in the group; each button also does its own action on Enter,
 * Space or a click (only Reset resets). A polite live region says where the
 * model is, e.g. "Turned 45 degrees, zoom 120%". Style the group so it is
 * visually hidden until it contains focus (`focus-within:`); `buttonClassName`
 * styles the buttons.
 */
export function InspectControl({
  target,
  className,
  buttonClassName,
  label = INSPECT_LABEL,
}: {
  target: React.RefObject<HTMLElement | null>;
  className?: string;
  buttonClassName?: string;
  label?: string;
}) {
  const inspect = useInspect(target);
  const group = React.useRef<HTMLDivElement>(null);
  const held = React.useRef(false);
  const [said, setSaid] = React.useState("");

  // Announce keyboard use, trailing and throttled.
  React.useEffect(() => {
    if (!inspect) return;
    let timer: number | undefined;
    const speak = () => {
      timer = undefined;
      const { yaw, zoom } = inspect.target;
      setSaid(
        `Turned ${norm((yaw * 180) / Math.PI)} degrees, zoom ${Math.round(zoom * 100)}%`
      );
    };
    const off = inspect.subscribe(() => {
      if (!held.current || timer !== undefined) return;
      timer = window.setTimeout(speak, ANNOUNCE_MS);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [inspect]);

  // If the scene is lent away while a button has focus, park focus on the
  // scene's container rather than dropping it to the page top.
  React.useEffect(() => {
    if (inspect || !held.current) return;
    held.current = false;
    const home = target.current?.parentElement;
    if (!home || document.activeElement !== document.body) return;
    const had = home.hasAttribute("tabindex");
    if (!had) home.setAttribute("tabindex", "-1");
    home.focus({ preventScroll: true });
    if (!had) {
      home.addEventListener("blur", () => home.removeAttribute("tabindex"), {
        once: true,
      });
    }
  }, [inspect, target]);

  if (!inspect) return null;
  const act = (key: string) => () => {
    inspect.key(key);
  };
  const buttons: [string, string, string][] = [
    ["Turn left", "ArrowLeft", "\u2190"],
    ["Turn right", "ArrowRight", "\u2192"],
    ["Zoom in", "+", "+"],
    ["Zoom out", "-", "\u2212"],
    ["Reset view", "0", "\u21ba"],
  ];
  return (
    <div
      ref={group}
      role="group"
      aria-label={label}
      data-inspect-control
      className={className}
      onFocus={() => {
        held.current = true;
      }}
      onBlur={(e) => {
        if (
          e.currentTarget.isConnected &&
          !e.currentTarget.contains(e.relatedTarget)
        ) {
          held.current = false;
        }
      }}
      onKeyDown={(e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (inspect.key(e.key, e.shiftKey)) e.preventDefault();
      }}
    >
      {buttons.map(([name, key, glyph]) => (
        <button
          key={name}
          type="button"
          aria-label={name}
          className={buttonClassName}
          onClick={act(key)}
        >
          <span aria-hidden>{glyph}</span>
        </button>
      ))}
      <span role="status" className="sr-only">
        {said}
      </span>
    </div>
  );
}

const isMac = () => /Mac/i.test(navigator.userAgent);

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
 * "swipe sideways to rotate · pinch to zoom" (on a mouse, "drag to rotate · ctrl + scroll to zoom", cmd on a Mac), shown
 * while `target`'s model is live until the first time any inspect on the
 * page is used, then never again for this viewer. Decorative, so
 * aria-hidden: the control's buttons offer the same actions.
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
      ? "swipe sideways to rotate · pinch to zoom"
      : `drag to rotate · ${isMac() ? "cmd" : "ctrl"} + scroll to zoom`);
  return (
    <p aria-hidden data-inspect-hint className={className}>
      {words}
    </p>
  );
}
