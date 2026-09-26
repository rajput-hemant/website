/** Dispatched on `window` to open the ⌘K menu from anywhere (e.g. the header button). */
export const OPEN_COMMAND_EVENT = "hr:open-command";

/** Dispatched on `window` by the menu's "Customize" action; the Customize panel listens for it. */
export const OPEN_CUSTOMIZE_EVENT = "hr:open-customize";

export function openCommandMenu(): void {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}
