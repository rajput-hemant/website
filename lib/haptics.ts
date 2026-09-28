import type { HapticInput, WebHaptics } from "web-haptics";

/**
 * Touch feedback, the touch counterpart of `lib/sound.ts`. The engine
 * (`web-haptics`, the Vibration API) is fetched on first use only, so it
 * never ships in the initial JS. `TouchHaptics` starts the import on the
 * first touch `pointerdown`, so the module is usually ready by the `click`
 * that follows; if it is not, the pattern plays once the import lands, which
 * Android honours (sticky activation).
 *
 * iOS has no Vibration API. Its only haptic is the tick of a native
 * `<input type=checkbox switch>` (Safari 17.4+) toggled by a trusted click,
 * and since iOS 26.5 a scripted `label.click()` no longer counts (WebKit bug
 * 309082), so `haptic()` stays still there and `TouchHaptics` lays a real,
 * transparent switch over toggle controls instead (`lib/haptic-switches.ts`).
 */
export type HapticKind = "tap" | "select" | "success" | "error" | "nudge";

// Full intensity for the short ones: below 1 the Vibration API path splits a
// pulse into shorter on/off slices, which most Android motors cannot render.
const PATTERNS: Record<HapticKind, HapticInput> = {
  tap: [{ duration: 10, intensity: 1 }],
  select: [{ duration: 15, intensity: 1 }],
  success: "success",
  error: "error",
  nudge: "nudge",
};

/** How long after the call a late-loading engine may still play it. */
const LATE_MS = 1000;

let engine: WebHaptics | null = null;
let loading: Promise<WebHaptics | null> | null = null;

/**
 * Starts fetching the engine; resolves to null on the server, on iOS (which
 * cannot use it) or on failure.
 */
export function preloadHaptics(): Promise<WebHaptics | null> {
  if (typeof window === "undefined" || switchHapticsOnly()) {
    return Promise.resolve(null);
  }
  loading ??= import("web-haptics").then(
    ({ WebHaptics: Engine }) => (engine = new Engine()),
    () => {
      // A failed chunk (offline) may be retried by the next gesture.
      loading = null;
      return null;
    }
  );
  return loading;
}

/**
 * True on iPhone and iPad (every iOS browser runs WebKit), where only a real
 * tap on a native switch buzzes. iPadOS reports a Mac user agent, told apart
 * by its touch points; a Vibration API means the engine can play instead.
 */
export function switchHapticsOnly(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate === "function") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

/**
 * True when the visitor wants feedback and can feel it: the preference on
 * (`data-haptics` on <html>, missing counts as on) and some touch input
 * present, so mouse-only desktops never fetch the engine.
 */
export function hapticsWanted(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.haptics === "off") return false;
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(any-pointer: coarse)").matches
  );
}

/** True when feedback may play now: wanted, in a visible document. */
export function hapticsAllowed(): boolean {
  return hapticsWanted() && !document.hidden;
}

export function haptic(kind: HapticKind): void {
  // On iOS the switch overlays tick by themselves; scripted feedback is mute.
  if (!hapticsAllowed() || switchHapticsOnly()) return;
  const input = PATTERNS[kind];
  if (engine) {
    void engine.trigger(input);
    return;
  }
  const asked = performance.now();
  void preloadHaptics().then((loaded) => {
    if (!loaded || performance.now() - asked > LATE_MS) return;
    if (hapticsAllowed()) void loaded.trigger(input);
  });
}

/** Stops a running pattern (e.g. a long nudge when the page hides). */
export function cancelHaptics(): void {
  engine?.cancel();
}
