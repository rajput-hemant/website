import type { Theme } from "@/flavors/drawing-set/lib/prefs";
import { setPrefs } from "@/flavors/drawing-set/lib/prefs-store";

const DURATION_MS = 400;
/** `--ease-enter` in styles.css. */
const EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

function resolves(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Sets the theme preference; when that changes what's on screen, the DOM
 * crossfades with the scene's 400ms palette tween (View Transitions).
 */
export function revealTheme(theme: Theme) {
  const root = document.documentElement;
  const apply = () => setPrefs({ theme });

  const unchanged = resolves(theme) === root.dataset.theme;
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    root.dataset.motion === "on" &&
    !document.hidden;
  if (unchanged || !canAnimate) {
    apply();
    return;
  }

  root.dataset.themeExposure = "";
  const transition = document.startViewTransition(apply);

  transition.ready
    .then(() => {
      const keyframes = { opacity: [1, 0] };
      root.animate(keyframes, {
        duration: DURATION_MS,
        easing: EASING,
        pseudoElement: "::view-transition-old(root)",
      });
      root.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DURATION_MS,
        easing: EASING,
        pseudoElement: "::view-transition-new(root)",
      });
    })
    .catch(() => {});

  void transition.finished.finally(() => {
    delete root.dataset.themeExposure;
  });
}
