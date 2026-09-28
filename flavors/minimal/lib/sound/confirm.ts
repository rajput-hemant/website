import type { Confirmation } from "./voices";

/**
 * Plays a confirmation (copied, sent, signed in, a form error) when sound is
 * on. The recipes and the engine load only then, so the default visitor, with
 * sound off, never fetches them.
 */
export function confirmSound(name: Confirmation): void {
  if (document.documentElement.dataset.sound !== "on") return;
  void import("./voices").then((mod) => mod.playConfirmation(name));
}
