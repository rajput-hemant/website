/**
 * Ask K1: the RFI slip's flight from the composer to the tray crosses two
 * tracked views, so the world (which knows where the tray is drawn) and the
 * flight view (which draws the slip between them) meet here, in the scene
 * chunk. Viewport CSS px throughout.
 */
export type TrayMark = {
  /** Where the tray's centre is drawn on screen. */
  x: number;
  y: number;
  /** How wide a slip lying in the tray is drawn. */
  width: number;
};

type Launch = (land: () => void) => boolean;

let tray: TrayMark | null = null;
let launch: Launch | null = null;

/** The world publishes the tray each frame it draws it, and null otherwise. */
export function markTray(next: TrayMark | null) {
  tray = next;
}

export function trayMark(): TrayMark | null {
  return tray;
}

/** The flight view offers to fly slips while it is mounted. */
export function acceptFlights(next: Launch | null) {
  launch = next;
}

/**
 * Sends a slip on its flight, calling `land` when it reaches the tray.
 * False when nothing can fly it (no flight view, no tray on screen, motion
 * off): the caller drops the slip straight into the tray instead.
 */
export function fly(land: () => void): boolean {
  return launch?.(land) ?? false;
}
