/** Dispatched on `window` to open the ⌘K menu from anywhere (e.g. the header button). */
export const OPEN_COMMAND_EVENT = "hr:open-command";

/** Dispatched on `window` to flip the ⌘K menu: what a trigger button sends, so a second click closes it. */
export const TOGGLE_COMMAND_EVENT = "hr:toggle-command";

export type CommandEventDetail = {
  /** The visitor used a pointer, so the menu may animate in; keyboard opens are instant. */
  pointer?: boolean;
};

export function openCommandMenu(detail?: CommandEventDetail): void {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT, { detail }));
}

export function toggleCommandMenu(detail?: CommandEventDetail): void {
  window.dispatchEvent(new CustomEvent(TOGGLE_COMMAND_EVENT, { detail }));
}
