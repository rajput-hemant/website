/** Dispatched on `window` to open the ⌘K menu from anywhere (e.g. the header button). */
export const OPEN_COMMAND_EVENT = "hr:open-command";

/** Dispatched on `window` to flip the ⌘K menu: what a trigger button sends, so a second click closes it. */
export const TOGGLE_COMMAND_EVENT = "hr:toggle-command";

export function openCommandMenu(): void {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}

/**
 * Flips the menu. `pointer` says a real click did it, so an edition may
 * animate the open (`takePointerOpen`); keyboard opens are instant.
 */
export function toggleCommandMenu(pointer = false): void {
  pointerOpen = pointer && !menuOpen;
  window.dispatchEvent(new Event(TOGGLE_COMMAND_EVENT));
}

/** Whether the open about to happen came from a pointer; reading it clears it. */
export function takePointerOpen(): boolean {
  const pointer = pointerOpen;
  pointerOpen = false;
  return pointer;
}

/**
 * Whether the menu is open, published by the menu and read by its trigger
 * buttons, which live elsewhere in the tree (`useSyncExternalStore`).
 */
let menuOpen = false;
let pointerOpen = false;
const listeners = new Set<() => void>();

export const getCommandMenuOpen = () => menuOpen;

export function setCommandMenuOpen(next: boolean): void {
  if (menuOpen === next) return;
  menuOpen = next;
  for (const listener of listeners) listener();
}

export function subscribeCommandMenuOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
