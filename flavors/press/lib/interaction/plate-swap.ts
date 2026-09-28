import type { Theme } from "@/flavors/press/lib/prefs";
import { setPrefs } from "@/flavors/press/lib/prefs-store";
import { pressVoices } from "@/flavors/press/lib/sound/voices";

import { isSoundOn, playVoice } from "@/lib/sound";

function resolves(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Sets the theme; when that changes what is on screen, the new plate is
 * pulled over the proof from the gripper edge, top first (a view transition
 * styled by `[data-plate-swap]` in styles.css; a crossfade with motion off).
 * With `voice`, the plate swap sounds on the frame the wipe starts.
 */
export function swapPlates(theme: Theme, { voice = false } = {}) {
  const root = document.documentElement;
  const sound = () => {
    if (voice && isSoundOn()) playVoice(pressVoices.plate);
  };
  const apply = () => setPrefs({ theme });

  const unchanged = resolves(theme) === root.dataset.theme;
  if (
    unchanged ||
    typeof document.startViewTransition !== "function" ||
    document.hidden
  ) {
    apply();
    if (!unchanged) sound();
    return;
  }

  // The whole page swaps as one plate: the header, frame and press lose
  // their own transition names for the length of the wipe.
  root.dataset.plateSwap = "";
  const transition = document.startViewTransition(apply);
  transition.ready.then(sound).catch(() => {});
  void transition.finished.finally(() => {
    delete root.dataset.plateSwap;
  });
}
