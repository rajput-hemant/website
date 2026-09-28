import type Lenis from "lenis";

/**
 * The one scroll source. Scene code reads `scroll` (updated by Lenis or native
 * scroll) instead of touching window.scrollY in a frame loop.
 */
export const scroll = { y: 0, velocity: 0, progress: 0 };

let lenis: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  lenis = next;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Scrolls smoothly when Lenis runs, natively (respecting motion) otherwise. */
export function scrollToTarget(target: number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target);
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top });
}

/**
 * Subtrees whose own scroll containers take the wheel instead of Lenis:
 * marked ones and modal dialogs. A non-modal popover keeps smooth scrolling
 * unless it opts out with `data-lenis-prevent`. Base UI's modal dialogs set
 * no `aria-modal`; their scroll lock is what the body check below catches.
 */
const NATIVE_SCROLL =
  '[data-lenis-prevent], [role="dialog"][aria-modal="true"], [role="alertdialog"]';

/** True while a modal holds the page still (`overflow: hidden` or `clip` on the viewport's scroller). */
function isPageScrollLocked(doc: Document): boolean {
  return [doc.documentElement, doc.body].some((element) =>
    /hidden|clip/.test(getComputedStyle(element).overflowY)
  );
}

/**
 * Lenis's `prevent` option: where the browser scrolls natively. Lenis
 * scrolls the window itself, which an `overflow: hidden` lock does not stop,
 * so without this a wheel over an open dialog glides the page behind it and
 * never reaches the dialog's list. Inside a modal dialog the nested
 * scroller takes the wheel (its `overscroll-behavior` keeps it there), and
 * while the page is locked every wheel is native, so one over the backdrop
 * or the dialog's chrome scrolls nothing. The lock is checked once per event,
 * at `<body>`, the last node Lenis offers.
 */
export function preventSmoothScroll(node: HTMLElement): boolean {
  if (node.matches(NATIVE_SCROLL)) return true;
  return (
    node === node.ownerDocument.body && isPageScrollLocked(node.ownerDocument)
  );
}
