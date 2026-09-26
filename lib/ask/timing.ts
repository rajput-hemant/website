import { askConfig } from "./config";

export type TimingVerdict =
  | { ok: true; elapsedMs: number }
  | { ok: false; reason: "too-fast" | "too-slow"; elapsedMs: number };

/**
 * Checks the client-measured time between the form mounting and the submission.
 * The client reports a duration rather than a timestamp, so its clock never has
 * to agree with the server's.
 */
export function checkTimeToSubmit(
  elapsedMs: number,
  window: { minMs: number; maxMs: number } = askConfig.timeToSubmit
): TimingVerdict {
  if (elapsedMs < window.minMs) {
    return { ok: false, reason: "too-fast", elapsedMs };
  }
  if (elapsedMs > window.maxMs) {
    return { ok: false, reason: "too-slow", elapsedMs };
  }
  return { ok: true, elapsedMs };
}
