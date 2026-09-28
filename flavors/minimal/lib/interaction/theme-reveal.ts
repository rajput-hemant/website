import { type Theme } from "@/flavors/minimal/lib/prefs";
import { setPrefs } from "@/flavors/minimal/lib/prefs-store";

const DURATION_MS = 400;
/** `--ease-enter` in globals.css. */
const EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

export type Point = { x: number; y: number };

function resolves(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Centre of `element`, for activations that carry no pointer position. */
export function centerOf(element: Element): Point {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * The click point of a pointer activation, or the control's centre for a
 * keyboard one (which reports 0,0).
 */
export function originOf(event: {
  clientX: number;
  clientY: number;
  detail: number;
  currentTarget: Element;
}): Point {
  return event.detail > 0
    ? { x: event.clientX, y: event.clientY }
    : centerOf(event.currentTarget);
}

/**
 * Sets the theme preference; when that changes what's on screen, the new
 * theme grows as a circle from `origin` over 400ms (View Transitions). The
 * preference mirror (PrefsSync) updates <html> synchronously inside the
 * transition's callback, so the new snapshot already has the new colours.
 *
 * Falls back to an instant switch without View Transitions support, with the
 * motion switch off or under reduced motion (both show as `data-motion="off"`),
 * and while the page is hidden.
 */
export function revealTheme(theme: Theme, origin: Point) {
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

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );

  root.dataset.themeReveal = "";
  const transition = document.startViewTransition(apply);

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: DURATION_MS,
          easing: EASING,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      // Skipped (another transition started): the theme is applied regardless.
    });

  void transition.finished.finally(() => {
    delete root.dataset.themeReveal;
  });
}
