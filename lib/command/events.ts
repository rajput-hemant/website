/** Dispatched on `window` to open the ⌘K menu from anywhere (e.g. the header button). */
export const OPEN_COMMAND_EVENT = "hr:open-command";

export function openCommandMenu(): void {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}
