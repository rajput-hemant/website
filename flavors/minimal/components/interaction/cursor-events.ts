/**
 * Dispatched on `window` after something is copied to the clipboard. The
 * cursor answers it with a brief "copied" label over `data-cursor="copy"`
 * controls; anything may dispatch it, and nothing breaks when no one listens.
 */
export const COPIED_EVENT = "hr:copied";

export function announceCopied(): void {
  window.dispatchEvent(new Event(COPIED_EVENT));
}
