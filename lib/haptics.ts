import type { HapticInput, WebHaptics } from "web-haptics";

/**
 * Touch feedback, the touch counterpart of `lib/sound.ts`. The engine
 * (`web-haptics`: the Vibration API on Android, the Safari 17.4+ switch
 * trick on iOS) is fetched on first use only, so it never ships in the
 * initial JS.
 *
 * Call `haptic()` synchronously inside the user-gesture handler: iOS only
 * answers a trusted activation. `TouchHaptics` starts the import on the first
 * touch `pointerdown`, so the module is usually ready by the `click` that
 * follows. If it is not, the pattern plays once the import lands, which
 * Android honours (sticky activation) but iOS may not, so the very first tap
 * on a cold cache can stay silent there. Confirmations after an await (a copy,
 * a send) have the same limit on iOS.
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

/** Starts fetching the engine; resolves to null on the server or on failure. */
export function preloadHaptics(): Promise<WebHaptics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
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
 * True when feedback may play: in a visible document, with the visitor's
 * preference on (`data-haptics` on <html>, missing counts as on) and some
 * touch input present, so mouse-only desktops never fetch the engine.
 */
export function hapticsAllowed(): boolean {
  if (typeof document === "undefined" || document.hidden) return false;
  if (document.documentElement.dataset.haptics === "off") return false;
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(any-pointer: coarse)").matches
  );
}

export function haptic(kind: HapticKind): void {
  if (!hapticsAllowed()) return;
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
